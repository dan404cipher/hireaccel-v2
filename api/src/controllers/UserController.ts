import { Response } from 'express';
import { z } from 'zod';
import { User } from '@/models/User';
import { Candidate } from '@/models/Candidate';
import { AuditLog } from '@/models/AuditLog';
import { AgentAssignment } from '@/models/AgentAssignment';

import { AuthenticatedRequest, UserRole, UserStatus, AuditAction } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError } from '@/middleware/errorHandler';
import { hashPassword, generateSecurePassword } from '@/utils/password';
import { generateCustomUserId } from '@/utils/customId';
import mongoose from 'mongoose';

/**
 * User Controller
 * Handles user management operations
 */

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8).optional(),
  phoneNumber: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number').optional().or(z.literal('')),
  source: z.enum([
    'Email',
    'WhatsApp',
    'Telegram',
    'Instagram',
    'Facebook',
    'Journals',
    'Posters',
    'Brochures',
    'Forums',
    'Google',
    'Conversational AI (GPT, Gemini etc)'
  ], { errorMap: () => ({ message: 'Source must be one of the valid options' }) }).optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(UserRole).optional(),
  phoneNumber: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number').optional().or(z.literal('')),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'lastLoginAt', 'firstName', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const agentAssignmentSchema = z.object({
  agentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid agent ID'),
  hrIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid HR ID')).optional().default([]),
  candidateIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID')).optional().default([]),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

export class UserController {
  /**
   * Get all users with pagination and filters
   * GET /users
   */
  static getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page, limit, role, status, search, sortBy, sortOrder } = querySchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    const query: any = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get users and total count
    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(query),
    ]);

    // For candidate users, fetch their candidate IDs
    const candidateUsers = users.filter(u => u.role === UserRole.CANDIDATE);
    if (candidateUsers.length > 0) {
      const candidates = await Candidate.find({ userId: { $in: candidateUsers.map(u => u._id) } })
        .select('_id userId');
      
      // Map candidate IDs to users
      users.forEach(user => {
        if (user.role === UserRole.CANDIDATE) {
          const candidate = candidates.find(c => c.userId.toString() === user._id.toString());
          if (candidate) {
            (user as any).candidateId = candidate._id;
          }
        }
      });
    }

    res.json({
      success: true,
      data: users,
      meta: {
        page: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: skip + users.length < total,
        },
        total,
        limit,
      },
    });
  });

  /**
   * Get user by ID
   * GET /users/:id
   */
  static getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      throw createNotFoundError('User', id);
    }
    
    res.json({
      success: true,
      data: user,
    });
  });

  /**
   * Get user by custom ID
   * GET /users/custom/:customId
   */
  static getUserByCustomId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { customId } = req.params;
    
    const user = await User.findOne({ customId }).select('-password');
    if (!user) {
      throw createNotFoundError('User', customId);
    }
    
    res.json({
      success: true,
      data: user,
    });
  });

  /**
   * Create new user
   * POST /users
   */
  static createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = createUserSchema.parse(req.body);
    
    // Prevent creating admin users through user management
    if (validatedData.role === UserRole.ADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Admin users cannot be created through user management. Use the create-admin script instead.',
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(validatedData.email);
    if (existingUser) {
      return res.status(409).json({
        type: 'https://httpstatuses.com/409',
        title: 'Conflict',
        status: 409,
        detail: 'User with this email already exists',
      });
    }
    
    // Generate password if not provided
    const password = validatedData.password || generateSecurePassword(12);
    const hashedPassword = await hashPassword(password);
    
    // Generate custom user ID based on role
    const customId = await generateCustomUserId(validatedData.role);
    
    const user = new User({
      ...validatedData,
      customId,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      emailVerified: true, // Admin-created users are auto-verified
    });
    
    await user.save();
    
    // If user is a candidate, create a corresponding Candidate document
    if (validatedData.role === UserRole.CANDIDATE) {
      const candidate = new Candidate({
        userId: user._id,
        status: 'active',
        profile: {
          preferredSalaryRange: { min: 0, max: 0, currency: 'USD' },
          skills: [],
          experience: [],
          education: [],
          certifications: [],
          projects: [],
          summary: '',
          location: '',
          phoneNumber: validatedData.phoneNumber || '',
          linkedinUrl: '',
          portfolioUrl: '',
          availability: {
            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            remote: false,
            relocation: false
          }
        },
        rating: 1,
        tags: [],
        profileViews: 0,
        notes: [],
        totalExperience: 0,
        experienceLevel: 'entry',
        hasResume: false,
        profileCompletion: 10
      });
      
      await candidate.save();
      console.log(`✅ Created candidate document for user ${user._id}`);
    }
    
    // Log user creation
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: user._id,
      after: user.toObject(),
      metadata: { createdByAdmin: true },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'user_management',
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          customId: user.customId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        ...(validatedData.password ? {} : { temporaryPassword: password }),
      },
    });
  });

  /**
   * Update user
   * PUT /users/:id
   */
  static updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updates = updateUserSchema.parse(req.body);
    
    // Prevent changing role to admin through user management
    if (updates.role && updates.role === UserRole.ADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Cannot change user role to admin through user management.',
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      throw createNotFoundError('User', id);
    }
    
    // Prevent editing existing admin users through user management
    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Admin users cannot be edited through user management.',
      });
    }
    
    const beforeState = user.toObject();
    
    // Update fields
    Object.assign(user, updates);
    await user.save();
    
    // Log user update
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'User',
      entityId: user._id,
      before: beforeState,
      after: user.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'user_management',
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  });

  /**
   * Delete user (soft delete)
   * DELETE /users/:id
   */
  static deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      throw createNotFoundError('User', id);
    }
    
    // Prevent deleting admin users through user management
    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Admin users cannot be deleted through user management.',
      });
    }
    
    const beforeState = user.toObject();
    
    // Soft delete by setting status to inactive
    user.status = UserStatus.INACTIVE;
    await user.save();
    
    // Log user deletion
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'User',
      entityId: user._id,
      before: beforeState,
      after: user.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'user_management',
      riskLevel: 'high',
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  /**
   * Get user statistics
   * GET /users/stats
   */
  static getUserStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', UserStatus.ACTIVE] }, 1, 0],
            },
          },
          lastLogin: { $max: '$lastLoginAt' },
        },
      },
      {
        $group: {
          _id: null,
          roleStats: {
            $push: {
              role: '$_id',
              total: '$count',
              active: '$active',
              lastLogin: '$lastLogin',
            },
          },
          totalUsers: { $sum: '$count' },
          totalActive: { $sum: '$active' },
        },
      },
    ]);
    
    const result = stats[0] || {
      roleStats: [],
      totalUsers: 0,
      totalActive: 0,
    };
    
    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Search users
   * GET /users/search
   */
  static searchUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q, role, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Search query is required',
      });
    }
    
    const query: any = {
      $text: { $search: q as string },
      status: UserStatus.ACTIVE,
    };
    
    if (role) query.role = role;
    
    const users = await User.find(query)
      .select('firstName lastName email role')
      .sort({ score: { $meta: 'textScore' } })
      .limit(Number(limit));
    
    res.json({
      success: true,
      data: users,
    });
  });

  /**
   * Get users by role
   * GET /users/role/:role
   */
  static getUsersByRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { role } = req.params;
    const { status = UserStatus.ACTIVE, limit = 50 } = req.query;
    
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Invalid user role',
      });
    }
    
    const users = await User.find({ role, status })
      .select('firstName lastName email lastLoginAt')
      .sort({ lastLoginAt: -1 })
      .limit(Number(limit));
    
    res.json({
      success: true,
      data: users,
    });
  });

  /**
   * Activate/Deactivate user
   * PATCH /users/:id/status
   */
  static updateUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = z.object({
      status: z.nativeEnum(UserStatus),
    }).parse(req.body);
    
    const user = await User.findById(id);
    if (!user) {
      throw createNotFoundError('User', id);
    }
    
    const beforeState = user.toObject();
    user.status = status;
    await user.save();
    
    // Log status change
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'User',
      entityId: user._id,
      before: beforeState,
      after: user.toObject(),
      metadata: { statusChange: { from: beforeState.status, to: status } },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'user_management',
    });
    
    res.json({
      success: true,
      message: `User ${status === UserStatus.ACTIVE ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  });

  /**
   * Create or update agent assignment (Admin assigns HR users and candidates to agent)
   * POST /users/agent-assignments
   */
  static createAgentAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    console.log('🔍 Agent Assignment Request:', {
      body: req.body,
      user: req.user?.email,
      role: req.user?.role,
      candidateIds: req.body.candidateIds,
      hrIds: req.body.hrIds
    });
    
    const validatedData = agentAssignmentSchema.parse(req.body);
    
    console.log('✅ Validated Data:', validatedData);

    // Verify agent exists and has correct role
    const agent = await User.findOne({
      _id: validatedData.agentId,
      role: UserRole.AGENT,
      $or: [
        { status: UserStatus.ACTIVE },
        { status: 'active' } // Fallback for any case sensitivity issues
      ]
    });
    
    if (!agent) {
      // Let's check what user exists with this ID
      const userWithId = await User.findById(validatedData.agentId);
      console.log('🔍 Agent validation failed:', {
        requestedAgentId: validatedData.agentId,
        foundUser: userWithId ? {
          id: userWithId._id,
          email: userWithId.email,
          role: userWithId.role,
          status: userWithId.status
        } : null
      });
      
      throw createNotFoundError('Active agent not found');
    }
    
    console.log('✅ Found agent:', { id: agent._id, email: agent.email, role: agent.role, status: agent.status });

    // Verify HR users exist and have correct role
    if (validatedData.hrIds.length > 0) {
      // First, let's check what users exist with these IDs (regardless of role/status)
      const allUsersWithIds = await User.find({
        _id: { $in: validatedData.hrIds }
      });
      console.log('🔍 All users with HR IDs:', allUsersWithIds.map(u => ({ id: u._id, email: u.email, role: u.role, status: u.status })));
      
      const hrUsers = await User.find({
        _id: { $in: validatedData.hrIds },
        role: UserRole.HR,
        $or: [
          { status: UserStatus.ACTIVE },
          { status: 'active' } // Fallback for any case sensitivity issues
        ]
      });
      
      console.log('✅ Found active HR users:', hrUsers.map(u => ({ id: u._id, email: u.email, role: u.role, status: u.status })));
      
      if (hrUsers.length !== validatedData.hrIds.length) {
        const missingIds = validatedData.hrIds.filter(id => 
          !hrUsers.some(hr => hr._id.toString() === id)
        );
        const missingUsers = allUsersWithIds.filter(u => 
          missingIds.includes(u._id.toString())
        );
        
        console.log('⚠️ Some HR users are inactive, filtering them out:', {
          requested: validatedData.hrIds.length,
          found: hrUsers.length,
          missingIds,
          missingUsers: missingUsers.map(u => ({ id: u._id, email: u.email, role: u.role, status: u.status }))
        });
        
        // Filter out inactive HR users and continue with only active ones
        validatedData.hrIds = hrUsers.map(hr => hr._id.toString());
        
        // Log the filtered assignment
        console.log('✅ Proceeding with only active HR users:', {
          originalCount: validatedData.hrIds.length + missingUsers.length,
          activeCount: validatedData.hrIds.length,
          filteredOut: missingUsers.length
        });
      }
    }

    // Verify candidates exist and get their candidate document IDs
    let candidateDocumentIds: string[] = [];
    if (validatedData.candidateIds && validatedData.candidateIds.length > 0) {
      console.log('🔍 Searching for candidate users:', validatedData.candidateIds);
      
      // First, let's check what users exist with these IDs (regardless of role/status)
      const allUsersWithIds = await User.find({
        _id: { $in: validatedData.candidateIds }
      });
      console.log('🔍 All users with these IDs:', allUsersWithIds.map(u => ({ id: u._id, email: u.email, role: u.role, status: u.status })));
      
      const candidateUsers = await User.find({
        _id: { $in: validatedData.candidateIds },
        role: UserRole.CANDIDATE,
        $or: [
          { status: UserStatus.ACTIVE },
          { status: 'active' } // Fallback for any case sensitivity issues
        ]
      });
      
      console.log('✅ Found candidate users:', candidateUsers.map(u => ({ id: u._id, email: u.email, role: u.role, status: u.status })));
      
      if (candidateUsers.length !== validatedData.candidateIds.length) {
        const missingCandidateIds = validatedData.candidateIds.filter(id => 
          !candidateUsers.some(c => c._id.toString() === id)
        );
        const missingCandidateUsers = allUsersWithIds.filter(u => 
          missingCandidateIds.includes(u._id.toString())
        );
        
        console.log('⚠️ Some candidates are inactive, filtering them out:', {
          requested: validatedData.candidateIds.length,
          found: candidateUsers.length,
          missingIds: missingCandidateIds,
          missingUsers: missingCandidateUsers.map(u => ({ id: u._id, email: u.email, role: u.role, status: u.status }))
        });
        
        // Filter out inactive candidates and continue with only active ones
        validatedData.candidateIds = candidateUsers.map(c => c._id.toString());
        
        console.log('✅ Proceeding with only active candidates:', {
          originalCount: validatedData.candidateIds.length + missingCandidateUsers.length,
          activeCount: validatedData.candidateIds.length,
          filteredOut: missingCandidateUsers.length
        });
      }

      // Get the candidate document IDs for these users
      const candidates = await Candidate.find({ userId: { $in: candidateUsers.map(u => u._id) } });
      const foundCandidateUserIds = candidates.map(c => c.userId.toString());
      
      console.log('✅ Found candidate documents:', candidates.map(c => ({ id: c._id, userId: c.userId })));
      
      // Create missing candidate documents for users that don't have them
      const missingCandidateUsers = candidateUsers.filter(u => !foundCandidateUserIds.includes(u._id.toString()));
      
      if (missingCandidateUsers.length > 0) {
        console.log('🔧 Creating missing candidate documents for users:', missingCandidateUsers.map(u => ({ id: u._id, email: u.email })));
        
        for (const user of missingCandidateUsers) {
          const newCandidate = new Candidate({
            userId: user._id,
            status: 'active',
            profile: {
              preferredSalaryRange: { min: 0, max: 0, currency: 'USD' },
              skills: [],
              experience: [],
              education: [],
              certifications: [],
              projects: [],
              summary: '',
              location: '',
              phoneNumber: user.phoneNumber || '',
              linkedinUrl: '',
              portfolioUrl: '',
              availability: {
                startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                remote: false,
                relocation: false
              }
            },
            rating: 1,
            tags: [],
            profileViews: 0,
            notes: [],
            totalExperience: 0,
            experienceLevel: 'entry',
            hasResume: false,
            profileCompletion: 10
          });
          
          await newCandidate.save();
          console.log(`✅ Created candidate document for user ${user._id}`);
        }
        
        // Re-fetch all candidate documents including the newly created ones
        const allCandidates = await Candidate.find({ userId: { $in: candidateUsers.map(u => u._id) } });
        candidateDocumentIds = allCandidates.map(c => c._id.toString());
      } else {
        candidateDocumentIds = candidates.map(c => c._id.toString());
      }
    }

    // Check if we have any active users to assign after filtering
    if (validatedData.hrIds.length === 0 && candidateDocumentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active users found to assign. All selected users are inactive.',
      });
    }

    // IMPORTANT: Remove HRs and candidates from other agent assignments to prevent duplicates
    if (validatedData.hrIds.length > 0 || validatedData.candidateIds.length > 0) {
      console.log('🔄 Removing HRs and candidates from other agent assignments...');
      
      // For candidates, we need to find their candidate document IDs to remove them from other assignments
      let candidateDocumentIdsForRemoval: string[] = [];
      if (validatedData.candidateIds.length > 0) {
        const candidatesForRemoval = await Candidate.find({ userId: { $in: validatedData.candidateIds } });
        candidateDocumentIdsForRemoval = candidatesForRemoval.map(c => c._id.toString());
        console.log('🔍 Candidate document IDs for removal:', candidateDocumentIdsForRemoval);
      }
      
      // Find all other assignments that contain any of the HRs or candidates we're about to assign
      const otherAssignments = await AgentAssignment.find({
        agentId: { $ne: validatedData.agentId }, // Exclude current agent
        $or: [
          { assignedHRs: { $in: validatedData.hrIds } },
          { assignedCandidates: { $in: candidateDocumentIdsForRemoval } }
        ]
      });

      console.log(`📋 Found ${otherAssignments.length} other assignments to update`);

      // Update each assignment to remove the HRs and candidates we're reassigning
      for (const assignment of otherAssignments) {
        const beforeState = assignment.toObject();
        
        // Remove HRs that are being reassigned
        if (validatedData.hrIds.length > 0) {
          assignment.assignedHRs = assignment.assignedHRs.filter(
            hrId => !validatedData.hrIds.includes(hrId.toString())
          );
        }
        
        // Remove candidates that are being reassigned
        if (candidateDocumentIdsForRemoval.length > 0) {
          assignment.assignedCandidates = assignment.assignedCandidates.filter(
            candidateId => !candidateDocumentIdsForRemoval.includes(candidateId.toString())
          );
        }
        
        await assignment.save();
        
        console.log(`✅ Updated assignment ${assignment._id}: removed ${beforeState.assignedHRs.length - assignment.assignedHRs.length} HRs, ${beforeState.assignedCandidates.length - assignment.assignedCandidates.length} candidates`);
        
        // Log the removal in audit trail
        await AuditLog.createLog({
          actor: req.user!._id,
          action: AuditAction.UPDATE,
          entityType: 'AgentAssignment',
          entityId: assignment._id,
          before: beforeState,
          after: assignment.toObject(),
          metadata: { 
            reason: 'resource_reassignment',
            removedHRs: validatedData.hrIds.filter(id => beforeState.assignedHRs.some(hr => hr.toString() === id)),
            removedCandidates: validatedData.candidateIds.filter(id => beforeState.assignedCandidates.some(c => c.toString() === id))
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          businessProcess: 'agent_management',
        });
      }
    }

    // Check if assignment already exists for this agent
    let assignment = await AgentAssignment.findOne({ agentId: validatedData.agentId });

    if (assignment) {
      // Update existing assignment
      const beforeState = assignment.toObject();
      
      // Merge existing and new HRs
      const existingHRs = assignment.assignedHRs.map(id => id.toString());
      const newHRs = validatedData.hrIds.filter(id => !existingHRs.includes(id));
      assignment.assignedHRs = [
        ...assignment.assignedHRs,
        ...newHRs.map(id => new mongoose.Types.ObjectId(id))
      ];

      // Merge existing and new candidates
      const existingCandidates = assignment.assignedCandidates.map(id => id.toString());
      const newCandidates = candidateDocumentIds.filter(id => !existingCandidates.includes(id));
      assignment.assignedCandidates = [
        ...assignment.assignedCandidates,
        ...newCandidates.map(id => new mongoose.Types.ObjectId(id))
      ];
      if (validatedData.notes !== undefined) {
        assignment.notes = validatedData.notes;
      }
      assignment.status = 'active';
      
      await assignment.save();

      // Log assignment update
      await AuditLog.createLog({
        actor: req.user!._id,
        action: AuditAction.UPDATE,
        entityType: 'AgentAssignment',
        entityId: assignment._id,
        before: beforeState,
        after: assignment.toObject(),
        metadata: { 
          agentId: validatedData.agentId,
          hrCount: validatedData.hrIds.length,
          candidateCount: validatedData.candidateIds.length
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        businessProcess: 'agent_management',
      });

      res.json({
        success: true,
        message: 'Agent assignment updated successfully',
        data: assignment,
        filteredUsers: validatedData.hrIds.length !== req.body.hrIds?.length || validatedData.candidateIds?.length !== req.body.candidateIds?.length ? {
          originalHRCount: req.body.hrIds?.length || 0,
          activeHRCount: validatedData.hrIds.length,
          originalCandidateCount: req.body.candidateIds?.length || 0,
          activeCandidateCount: validatedData.candidateIds?.length || 0
        } : undefined
      });
    } else {
      // Create new assignment
      assignment = await AgentAssignment.create({
        agentId: validatedData.agentId,
        assignedHRs: validatedData.hrIds.map(id => new mongoose.Types.ObjectId(id)),
        assignedCandidates: candidateDocumentIds.map(id => new mongoose.Types.ObjectId(id)),
        assignedBy: req.user!._id,
        notes: validatedData.notes,
        status: 'active',
      });

      // Log assignment creation
      await AuditLog.createLog({
        actor: req.user!._id,
        action: AuditAction.CREATE,
        entityType: 'AgentAssignment',
        entityId: assignment._id,
        after: assignment.toObject(),
        metadata: { 
          agentId: validatedData.agentId,
          hrCount: validatedData.hrIds.length,
          candidateCount: validatedData.candidateIds.length
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        businessProcess: 'agent_management',
      });

      res.status(201).json({
        success: true,
        message: 'Agent assignment created successfully',
        data: assignment,
        filteredUsers: validatedData.hrIds.length !== req.body.hrIds?.length || validatedData.candidateIds?.length !== req.body.candidateIds?.length ? {
          originalHRCount: req.body.hrIds?.length || 0,
          activeHRCount: validatedData.hrIds.length,
          originalCandidateCount: req.body.candidateIds?.length || 0,
          activeCandidateCount: validatedData.candidateIds?.length || 0
        } : undefined
      });
    }
  });

  /**
   * Get all agent assignments
   * GET /users/agent-assignments
   */
  static getAgentAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const assignments = await AgentAssignment.getAgentsWithAssignments();

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'AgentAssignment',
      entityId: new mongoose.Types.ObjectId(),
      metadata: { queryType: 'list_all', resultCount: assignments.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'agent_management',
      description: `Retrieved ${assignments.length} agent assignments`,
    });

    res.json({
      success: true,
      data: assignments,
    });
  });

  /**
   * Get current agent's assignment details
   * GET /users/agent-assignments/me
   */
  static getMyAgentAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const currentUserId = req.user!._id;

    const assignment = await AgentAssignment.getAssignmentForAgent(currentUserId);

    if (!assignment) {
      // Return a default assignment structure for agents without assignments
      const defaultAssignment = {
        _id: null,
        agentId: {
          _id: currentUserId,
          firstName: req.user!.firstName,
          lastName: req.user!.lastName,
          email: req.user!.email
        },
        assignedHRs: [],
        assignedCandidates: [],
        assignedBy: null,
        status: 'inactive',
        notes: 'No assignment created yet',
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Log audit trail for default assignment
      await AuditLog.createLog({
        actor: req.user!._id,
        action: AuditAction.READ,
        entityType: 'AgentAssignment',
        entityId: currentUserId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        businessProcess: 'agent_management',
        description: 'Retrieved default agent assignment (no assignment found)',
      });

      return res.json({
        success: true,
        data: defaultAssignment,
      });
    }

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'AgentAssignment',
      entityId: assignment._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'agent_management',
      description: 'Retrieved current agent assignment details',
    });

    res.json({
      success: true,
      data: assignment,
    });
  });

  /**
   * Get specific agent assignment
   * GET /users/agent-assignments/:agentId
   */
  static getAgentAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { agentId } = req.params;

    const assignment = await AgentAssignment.getAssignmentForAgent(new mongoose.Types.ObjectId(agentId));

    if (!assignment) {
      throw createNotFoundError('Agent assignment not found');
    }

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'AgentAssignment',
      entityId: assignment._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'agent_management',
      description: 'Retrieved agent assignment details',
    });

    res.json({
      success: true,
      data: assignment,
    });
  });

  /**
   * Debug endpoint to see all agent assignments (Admin only)
   * GET /users/agent-assignments/debug/all
   */
  static debugAllAgentAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only allow admins to access this debug endpoint
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
      });
    }

    const allAssignments = await AgentAssignment.find({})
      .populate('agentId', 'firstName lastName email role')
      .populate('assignedHRs', 'firstName lastName email role')
      .populate('assignedCandidates', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    const assignmentsWithDetails = allAssignments.map(assignment => {
      const assignmentObj = assignment.toObject();
      return {
        _id: assignmentObj._id,
        agent: assignmentObj.agentId ? {
          _id: assignmentObj.agentId._id,
          name: `${(assignmentObj.agentId as any).firstName} ${(assignmentObj.agentId as any).lastName}`,
          email: (assignmentObj.agentId as any).email,
          role: (assignmentObj.agentId as any).role
        } : null,
        assignedHRs: assignmentObj.assignedHRs?.map((hr: any) => ({
          _id: hr._id,
          name: `${(hr as any).firstName} ${(hr as any).lastName}`,
          email: (hr as any).email,
          role: (hr as any).role
        })) || [],
        assignedCandidates: assignmentObj.assignedCandidates?.map((candidate: any) => ({
          _id: candidate._id,
          name: `${(candidate as any).firstName} ${(candidate as any).lastName}`,
          email: (candidate as any).email,
          role: (candidate as any).role
        })) || [],
        status: assignmentObj.status,
        createdAt: assignmentObj.createdAt
      };
    });

    res.json({
      success: true,
      data: assignmentsWithDetails,
      total: assignmentsWithDetails.length,
      message: 'Debug: All agent assignments with details'
    });
  });

  /**
   * Remove resources from agent assignment
   * PATCH /users/agent-assignments/:agentId/remove
   */
  static removeFromAgentAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { agentId } = req.params;
    const { hrIds = [], candidateIds = [] } = req.body;

    console.log('🔍 Remove from agent assignment request:', {
      agentId,
      hrIds,
      candidateIds,
      user: req.user?.email
    });

    if (hrIds.length === 0 && candidateIds.length === 0) {
      throw createBadRequestError('At least one HR ID or candidate ID must be provided');
    }

    const assignment = await AgentAssignment.findOne({ agentId });

    if (!assignment) {
      throw createNotFoundError('Agent assignment not found');
    }

    const beforeState = assignment.toObject();

    // Remove HR users
    if (hrIds.length > 0) {
      const hrObjectIds = hrIds.map((id: string) => new mongoose.Types.ObjectId(id));
      assignment.assignedHRs = assignment.assignedHRs.filter(
        (hrId: mongoose.Types.ObjectId) => !hrObjectIds.some((id: mongoose.Types.ObjectId) => id.equals(hrId))
      );
    }

    // Remove candidates
    if (candidateIds.length > 0) {
      // Convert User IDs to Candidate document IDs
      const candidateDocuments = await Candidate.find({ 
        userId: { $in: candidateIds.map((id: string) => new mongoose.Types.ObjectId(id)) } 
      });
      
      const candidateDocumentIds = candidateDocuments.map(candidate => candidate._id);
      
      console.log('🔍 Candidate removal debug:', {
        inputUserIds: candidateIds,
        foundCandidateDocuments: candidateDocuments.map(c => ({ candidateId: c._id, userId: c.userId })),
        candidateDocumentIds: candidateDocumentIds,
        beforeRemoval: assignment.assignedCandidates.length,
        assignedCandidates: assignment.assignedCandidates
      });
      
      assignment.assignedCandidates = assignment.assignedCandidates.filter(
        (candidateId: mongoose.Types.ObjectId) => !candidateDocumentIds.some((id: mongoose.Types.ObjectId) => id.equals(candidateId))
      );
      
      console.log('🔍 After candidate removal:', {
        afterRemoval: assignment.assignedCandidates.length,
        remainingCandidates: assignment.assignedCandidates
      });
    }

    await assignment.save();

    // Populate the updated assignment for response
    const updatedAssignment = await AgentAssignment.findById(assignment._id)
      .populate('agentId', 'firstName lastName email')
      .populate('assignedHRs', 'firstName lastName email')
      .populate({
        path: 'assignedCandidates',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('assignedBy', 'firstName lastName email');

    // Log assignment update
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'AgentAssignment',
      entityId: assignment._id,
      before: beforeState,
      after: updatedAssignment?.toObject(),
      metadata: { 
        agentId, 
        removedHRs: hrIds, 
        removedCandidates: candidateIds,
        remainingHRs: assignment.assignedHRs.length,
        remainingCandidates: assignment.assignedCandidates.length
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'agent_management',
    });

    res.json({
      success: true,
      message: 'Resources removed from agent assignment successfully',
      data: updatedAssignment,
    });
  });

  /**
   * Delete agent assignment
   * DELETE /users/agent-assignments/:agentId
   */
  static deleteAgentAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { agentId } = req.params;

    const assignment = await AgentAssignment.findOne({ agentId });

    if (!assignment) {
      throw createNotFoundError('Agent assignment not found');
    }

    const beforeState = assignment.toObject();
    await AgentAssignment.findByIdAndDelete(assignment._id);

    // Log assignment deletion
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'AgentAssignment',
      entityId: assignment._id,
      before: beforeState,
      metadata: { agentId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'agent_management',
    });

    res.json({
      success: true,
      message: 'Agent assignment deleted successfully',
    });
  });
}
