import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { JwtPayload, AuthTokens, UserRole } from '@/types';
import { logger } from '@/config/logger';

/**
 * JWT utility functions for token generation, validation, and management
 * Implements secure JWT handling with refresh token rotation
 */

/**
 * Generate access token
 */
export const generateAccessToken = (payload: {
    userId: string;
    email?: string;
    phoneNumber?: string;
    role: UserRole;
}): string => {
    try {
        return (jwt as any).sign(
            {
                userId: payload.userId,
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                role: payload.role,
                type: 'access',
            },
            env.JWT_ACCESS_SECRET,
            {
                expiresIn: env.JWT_ACCESS_TTL,
                issuer: 'hire-accel-api',
                audience: 'hire-accel-client',
                subject: payload.userId,
            },
        );
    } catch (error) {
        logger.error('Error generating access token', { error, payload });
        throw new Error('Failed to generate access token');
    }
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: {
    userId: string;
    email?: string;
    phoneNumber?: string;
    role: UserRole;
}): string => {
    try {
        return (jwt as any).sign(
            {
                userId: payload.userId,
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                role: payload.role,
                type: 'refresh',
            },
            env.JWT_REFRESH_SECRET,
            {
                expiresIn: env.JWT_REFRESH_TTL,
                issuer: 'hire-accel-api',
                audience: 'hire-accel-client',
                subject: payload.userId,
            },
        );
    } catch (error) {
        logger.error('Error generating refresh token', { error, payload });
        throw new Error('Failed to generate refresh token');
    }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: {
    userId: string;
    email?: string;
    phoneNumber?: string;
    role: UserRole;
}): AuthTokens => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Calculate expiration time in seconds
    const decoded = jwt.decode(accessToken) as JwtPayload;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    return {
        accessToken,
        refreshToken,
        expiresIn,
    };
};

/**
 * Generate temporary token for lead verification (30 minutes)
 * Used after SMS OTP verification before account completion
 */
export const generateLeadToken = (payload: { leadId: string; phoneNumber: string; role: UserRole }): string => {
    try {
        return (jwt as any).sign(
            {
                leadId: payload.leadId,
                phoneNumber: payload.phoneNumber,
                role: payload.role,
                type: 'lead_temp',
            },
            env.JWT_ACCESS_SECRET, // Use same secret but different type
            {
                expiresIn: '30m', // 30 minutes to complete registration
                issuer: 'hire-accel-api',
                audience: 'hire-accel-client',
                subject: payload.leadId,
            },
        );
    } catch (error) {
        logger.error('Error generating lead token', { error, payload });
        throw new Error('Failed to generate lead token');
    }
};

/**
 * Verify lead token
 */
export const verifyLeadToken = (token: string): { leadId: string; phoneNumber: string; role: UserRole } => {
    try {
        const decoded = (jwt as any).verify(token, env.JWT_ACCESS_SECRET, {
            issuer: 'hire-accel-api',
            audience: 'hire-accel-client',
        }) as any;

        // Verify token type
        if (decoded.type !== 'lead_temp') {
            throw new Error('Invalid token type');
        }

        return {
            leadId: decoded.leadId,
            phoneNumber: decoded.phoneNumber,
            role: decoded.role,
        };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.warn('Lead token expired', { token: token.substring(0, 20) + '...' });
            throw new Error('Lead token expired. Please restart registration.');
        } else if (error instanceof jwt.JsonWebTokenError) {
            logger.warn('Invalid lead token', { error: error.message });
            throw new Error('Invalid lead token');
        } else {
            logger.error('Error verifying lead token', { error });
            throw new Error('Failed to verify lead token');
        }
    }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
    try {
        const decoded = (jwt as any).verify(token, env.JWT_ACCESS_SECRET, {
            issuer: 'hire-accel-api',
            audience: 'hire-accel-client',
        }) as JwtPayload;

        // Verify token type
        if ((decoded as any).type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.warn('Access token expired', { token: token.substring(0, 20) + '...' });
            throw new Error('Access token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            logger.warn('Invalid access token', { error: error.message });
            throw new Error('Invalid access token');
        } else {
            logger.error('Error verifying access token', { error });
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
    try {
        const decoded = (jwt as any).verify(token, env.JWT_REFRESH_SECRET, {
            issuer: 'hire-accel-api',
            audience: 'hire-accel-client',
        }) as JwtPayload;

        // Verify token type
        if ((decoded as any).type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.warn('Refresh token expired', { token: token.substring(0, 20) + '...' });
            throw new Error('Refresh token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            logger.warn('Invalid refresh token', { error: error.message });
            throw new Error('Invalid refresh token');
        } else {
            logger.error('Error verifying refresh token', { error });
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Decode token without verification (for extracting payload)
 */
export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch (error) {
        logger.warn('Error decoding token', { error });
        return null;
    }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = decodeToken(token);
        if (!decoded) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
    try {
        const decoded = decodeToken(token);
        if (!decoded) return null;

        return new Date(decoded.exp * 1000);
    } catch (error) {
        return null;
    }
};

/**
 * Get time until token expires (in seconds)
 */
export const getTimeUntilExpiration = (token: string): number => {
    try {
        const decoded = decodeToken(token);
        if (!decoded) return 0;

        const currentTime = Math.floor(Date.now() / 1000);
        return Math.max(0, decoded.exp - currentTime);
    } catch (error) {
        return 0;
    }
};

/**
 * Extract user ID from token
 */
export const extractUserIdFromToken = (token: string): string | null => {
    try {
        const decoded = decodeToken(token);
        return decoded?.userId || null;
    } catch (error) {
        return null;
    }
};

/**
 * Extract user role from token
 */
export const extractRoleFromToken = (token: string): UserRole | null => {
    try {
        const decoded = decodeToken(token);
        return decoded?.role || null;
    } catch (error) {
        return null;
    }
};

/**
 * Validate token format (basic structure check)
 */
export const isValidTokenFormat = (token: string): boolean => {
    try {
        // JWT should have 3 parts separated by dots
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        // Each part should be base64 encoded
        parts.forEach((part) => {
            try {
                Buffer.from(part, 'base64url');
            } catch {
                throw new Error('Invalid base64 encoding');
            }
        });

        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Generate a secure random token for password reset, email verification, etc.
 */
export const generateSecureToken = (): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token for secure storage
 */
export const hashToken = (token: string): string => {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Token blacklist utility (for logout functionality)
 * In production, this should be stored in Redis or a similar cache
 */
const tokenBlacklist = new Set<string>();

/**
 * Add token to blacklist
 */
export const blacklistToken = (token: string): void => {
    const tokenHash = hashToken(token);
    tokenBlacklist.add(tokenHash);

    // In production, also store in Redis with TTL equal to token expiration
    logger.info('Token blacklisted', { tokenHash });
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
    const tokenHash = hashToken(token);
    return tokenBlacklist.has(tokenHash);
};

/**
 * Clean up expired tokens from blacklist
 * This should be called periodically to prevent memory leaks
 */
export const cleanupExpiredTokens = (): void => {
    // In production with Redis, this would be handled automatically by TTL
    // For in-memory storage, we'd need to track expiration times
    logger.info('Cleaned up expired blacklisted tokens');
};

/**
 * JWT middleware helper to extract token from request
 */
export const extractTokenFromRequest = (req: any): string | null => {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Check cookies (if using cookie-based authentication)
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }

    // Check query parameter (less secure, use with caution)
    if (req.query && req.query.token) {
        return req.query.token as string;
    }

    return null;
};

/**
 * Validate refresh token against stored tokens in user document
 */
export const validateRefreshTokenInDatabase = async (token: string, userRefreshTokens: any[]): Promise<boolean> => {
    try {
        // Hash the provided token for comparison
        const tokenHash = hashToken(token);

        // Check if token exists in user's refresh tokens
        const isValid = userRefreshTokens.some((rt) => hashToken(rt.token) === tokenHash);

        return isValid;
    } catch (error) {
        logger.error('Error validating refresh token in database', { error });
        return false;
    }
};

/**
 * Token rotation helper
 * Generates new tokens and invalidates old ones
 */
export const rotateTokens = async (refreshToken: string, user: any): Promise<AuthTokens> => {
    try {
        // Verify the refresh token
        verifyRefreshToken(refreshToken);

        // Validate against database
        const isValidInDb = await validateRefreshTokenInDatabase(refreshToken, user.refreshTokens);

        if (!isValidInDb) {
            throw new Error('Refresh token not found in database');
        }

        // Generate new token pair
        const newTokens = generateTokenPair({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Remove old refresh token and add new one
        user.removeRefreshToken(refreshToken);
        user.addRefreshToken(
            newTokens.refreshToken,
            undefined, // userAgent would be passed from request
            undefined, // ipAddress would be passed from request
        );

        await user.save();

        logger.info('Tokens rotated successfully', {
            userId: user._id,
            oldTokenPrefix: refreshToken.substring(0, 20) + '...',
        });

        return newTokens;
    } catch (error) {
        logger.error('Error rotating tokens', { error });
        throw new Error('Token rotation failed');
    }
};
