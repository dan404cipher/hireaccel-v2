import { Request, Response, NextFunction } from 'express';
import { User } from '@/models/User';
import { AuthenticatedRequest, UserRole } from '@/types';
import { 
  verifyAccessToken, 
  extractTokenFromRequest, 
  isTokenBlacklisted 
} from '@/utils/jwt';
import { 
  createUnauthorizedError, 
  createForbiddenError,
  createBadRequestError
} from '@/middleware/errorHandler';
import { logger } from '@/config/logger';

/**
 * Authentication middleware
 * Validates JWT tokens and attaches user information to request object
 */

/**
 * Authenticate user middleware
 * Validates access token and loads user information
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      throw createUnauthorizedError('Access token is required');
    }
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      throw createUnauthorizedError('Token has been revoked');
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Load user from database
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    
    if (!user) {
      throw createUnauthorizedError('User not found');
    }
    
    // Check if user is active or pending (pending users can access app but with limited features)
    if (user.status === 'suspended' || user.status === 'inactive') {
      throw createUnauthorizedError('Account is suspended or inactive');
    }
    
    // Attach user to request
    (req as AuthenticatedRequest).user = user;
    
    // Log authentication success
    logger.debug('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Loads user if token is provided, but doesn't require authentication
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (token && !isTokenBlacklisted(token)) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId);
        
        if (user && (user.status === 'active' || user.status === 'pending')) {
          (req as AuthenticatedRequest).user = user;
        }
      } catch (error) {
        // Ignore authentication errors for optional auth
        logger.debug('Optional authentication failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware factory
 * Creates middleware that checks if user has required role(s)
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    try {
      if (!user) {
        throw createUnauthorizedError('Authentication required');
      }
      
      if (!allowedRoles.includes(user.role)) {
        throw createForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        );
      }
      
      logger.debug('Role authorization successful', {
        userId: user._id,
        userRole: user.role,
        requiredRoles: allowedRoles,
      });
      
      next();
    } catch (error) {
      logger.warn('Role authorization failed', {
        userId: user?._id,
        userRole: user?.role,
        requiredRoles: allowedRoles,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  };
};

/**
 * Specific role middleware shortcuts
 */
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireHR = requireRole(UserRole.HR, UserRole.ADMIN);
export const requireAgent = requireRole(UserRole.AGENT, UserRole.HR, UserRole.ADMIN);
export const requirePartner = requireRole(UserRole.PARTNER, UserRole.ADMIN);
export const requireCandidate = requireRole(UserRole.CANDIDATE);

/**
 * Allow self update or admin middleware
 * Allows users to update their own data or admins to update any user
 */
export const allowSelfOrAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw createUnauthorizedError('Authentication required');
    }

    // Admin can update any user
    if (user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Users can update their own profile
    const targetUserId = req.params['id'];
    if (user._id.toString() === targetUserId) {
      next();
      return;
    }

    throw createForbiddenError('Access denied. You can only update your own profile.');
  } catch (error) {
    next(error);
  }
};

/**
 * Resource ownership middleware
 * Checks if user owns the requested resource or has admin privileges
 */
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        throw createUnauthorizedError('Authentication required');
      }
      
      // Admin can access all resources
      if (user.role === UserRole.ADMIN) {
        next();
        return;
      }
      
      // Get resource user ID from params, body, or query
      const resourceUserId = req.params[resourceUserIdField] || 
                           req.body[resourceUserIdField] || 
                           req.query[resourceUserIdField];
      
      if (!resourceUserId) {
        throw createForbiddenError('Resource ownership cannot be determined');
      }
      
      if (user._id.toString() !== resourceUserId.toString()) {
        throw createForbiddenError('Access denied. You can only access your own resources.');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Candidate profile access middleware
 * Allows candidates to access their own profile, agents to access assigned candidates,
 * HR and admin to access all candidates
 */
export const requireCandidateAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw createUnauthorizedError('Authentication required');
    }
    
    const candidateId = req.params['candidateId'] || req.params['id'];
    
    if (!candidateId) {
      throw createForbiddenError('Candidate ID is required');
    }
    
    // Admin and HR have access to all candidates
    if ([UserRole.ADMIN, UserRole.HR].includes(user.role!)) {
      // Convert customId to MongoDB _id for all users
      const { User } = await import('@/models/User');
      const { Candidate } = await import('@/models/Candidate');

      // First find the user by customId
      const targetUser = await User.findOne({ customId: candidateId });
      if (!targetUser) {
        throw createBadRequestError('Invalid candidate ID');
      }

      // Then find the candidate by userId
      const candidate = await Candidate.findOne({ userId: targetUser._id });
      if (!candidate) {
        throw createBadRequestError('Candidate profile not found');
      }

      // Attach the candidate ID to the request for the controller
      req.params['id'] = candidate._id.toString();
      
      next();
      return;
    }
    
    // Candidates can only access their own profile
    if (user.role === UserRole.CANDIDATE) {
      const { User } = await import('@/models/User');
      const { Candidate } = await import('@/models/Candidate');

      // First find the user by customId
      const targetUser = await User.findOne({ customId: candidateId });
      if (!targetUser) {
        throw createBadRequestError('Invalid candidate ID');
      }

      // Then find the candidate by userId
      const candidate = await Candidate.findOne({ userId: targetUser._id });
      if (!candidate) {
        throw createBadRequestError('Candidate profile not found');
      }

      // Check if this is the user's own profile
      if (targetUser._id.toString() !== user._id.toString()) {
        throw createForbiddenError('Access denied. You can only access your own profile.');
      }

      // Attach the candidate ID to the request for the controller
      req.params['id'] = candidate._id.toString();
      
      next();
      return;
    }
    
    // Agents can access their assigned candidates
    if (user.role === UserRole.AGENT) {
      // For now, allow agents to access all candidates
      // TODO: Implement proper assignment checking
      const { User } = await import('@/models/User');
      const { Candidate } = await import('@/models/Candidate');

      // First find the user by customId
      const targetUser = await User.findOne({ customId: candidateId });
      if (!targetUser) {
        throw createBadRequestError('Invalid candidate ID');
      }

      // Then find the candidate by userId
      const candidate = await Candidate.findOne({ userId: targetUser._id });
      if (!candidate) {
        throw createBadRequestError('Candidate profile not found');
      }

      // Attach the candidate ID to the request for the controller
      req.params['id'] = candidate._id.toString();
      
      next();
      return;
    }
    
    throw createForbiddenError('Access denied.');
  } catch (error) {
    next(error);
  }
};

/**
 * Job access middleware
 * Controls access to job resources based on user role and company association
 */
export const requireJobAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw createUnauthorizedError('Authentication required');
    }
    
    const jobId = req.params['jobId'] || req.params['id'];
    
    if (!jobId) {
      throw createForbiddenError('Job ID is required');
    }
    
    // Admin and HR have access to all jobs
    if ([UserRole.ADMIN, UserRole.HR].includes(user.role)) {
      next();
      return;
    }
    
    const { Job } = await import('@/models/Job');
    const job = await Job.findById(jobId).populate('companyId');
    
    if (!job) {
      throw createForbiddenError('Job not found');
    }
    
    // Partners can only access jobs from their company
    if (user.role === UserRole.PARTNER) {
      // TODO: Implement company association check
      // This would require checking if user is associated with the job's company
      next();
      return;
    }
    
    // Agents can access jobs assigned to them
    if (user.role === UserRole.AGENT) {
      if (job.assignedAgentId?.toString() === user._id.toString()) {
        next();
        return;
      }
    }
    
    throw createForbiddenError('Access denied.');
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limiting middleware per user
 * Limits requests per authenticated user
 */
export const rateLimitPerUser = (maxRequests: number, windowMs: number) => {
  const userRequestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      next();
      return;
    }
    
    const userId = user._id.toString();
    const now = Date.now();
    
    const userLimit = userRequestCounts.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize limit
      userRequestCounts.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }
    
    if (userLimit.count >= maxRequests) {
      _res.status(429).json({
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Requests',
        status: 429,
        detail: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
      });
      return;
    }
    
    userLimit.count++;
    next();
  };
};

/**
 * API key authentication middleware (for service-to-service communication)
 */
export const authenticateApiKey = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw createUnauthorizedError('API key is required');
    }
    
    // TODO: Implement API key validation
    // This would check against a database of valid API keys
    
    logger.debug('API key authentication successful', { apiKey: apiKey.substring(0, 8) + '...' });
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Session validation middleware
 * Validates session integrity and checks for suspicious activity
 */
export const validateSession = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      next();
      return;
    }
    
    // TODO: Implement session validation logic
    // This could include checking IP consistency, user agent consistency, etc.
    // Check for suspicious activity indicators:
    // - Multiple IP addresses in short time
    // - Multiple user agents in short time  
    // - Unusual access patterns
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require email verification
 */
export const requireEmailVerification = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw createUnauthorizedError('Authentication required');
    }
    
    if (!user.emailVerified) {
      throw createForbiddenError('Email verification required. Please verify your email address.');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check account status
 */
export const requireActiveAccount = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw createUnauthorizedError('Authentication required');
    }
    
    if (user.status === 'suspended') {
      throw createForbiddenError('Account is suspended. Please contact support.');
    }
    
    if (user.status === 'inactive') {
      throw createForbiddenError('Account is inactive. Please contact administrator.');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
