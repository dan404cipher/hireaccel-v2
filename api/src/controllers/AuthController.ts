import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '@/services/AuthService';
import { AuthenticatedRequest, UserRole } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';

/**
 * Authentication Controller
 * Handles all authentication-related HTTP requests
 */

/**
 * Validation schemas for authentication endpoints
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Invalid user role' }) }),
  phone: z.string().optional(),
  department: z.string().optional(),
  currentLocation: z.string().optional(),
  yearsOfExperience: z.string().optional(),
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
  ], { errorMap: () => ({ message: 'Source is required and must be one of the valid options' }) }),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resendOTPSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// const _refreshTokenSchema = z.object({
//   refreshToken: z.string().min(1, 'Refresh token is required'),
// });

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  static register = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const validatedData = registerSchema.parse(req.body);
    
    const context: { ipAddress?: string; userAgent?: string } = {};
    if (req.ip) context.ipAddress = req.ip;
    if (req.get('user-agent')) context.userAgent = req.get('user-agent')!;
    
    // Filter out undefined values for optional fields
    const userData = {
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
      source: validatedData.source,
      ...(validatedData.phone && { phone: validatedData.phone }),
      ...(validatedData.department && { department: validatedData.department }),
      ...(validatedData.currentLocation && { currentLocation: validatedData.currentLocation }),
      ...(validatedData.yearsOfExperience && { yearsOfExperience: validatedData.yearsOfExperience }),
    };
    
    const result = await AuthService.register(userData);
    
    res.status(200).json({
      success: result.success,
      message: result.message,
      data: {
        requiresOTP: result.requiresOTP,
        email: userData.email,
      },
    });  });

  /**
   * Verify OTP and complete registration
   * POST /auth/verify-otp
   */
  static verifyOTP = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = verifyOTPSchema.parse(req.body);
    
    const context: { ipAddress?: string; userAgent?: string } = {};
    if (req.ip) context.ipAddress = req.ip;
    if (req.get("user-agent")) context.userAgent = req.get("user-agent")!;
    
    const { user, tokens } = await AuthService.verifyOTPAndRegister(
      validatedData.email,
      validatedData.otp,
      context
    );
    
    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.status(201).json({
      success: true,
      message: "Account created and verified successfully! Welcome to Hiring Accelerator.",
      data: {
        user: {
          id: user._id,
          customId: user.customId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        },
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  });

  /**
   * Resend OTP
   * POST /auth/resend-otp
   */
  static resendOTP = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = resendOTPSchema.parse(req.body);
    
    await AuthService.resendOTP(validatedData.email);
    
    res.status(200).json({
      success: true,
      message: "OTP has been resent to your email.",
      data: {
        email: validatedData.email,
      },
    });
  });

  /**
   * Login user
   * POST /auth/login
   */
  static login = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { email, password } = loginSchema.parse(req.body);
    
    const context: { ipAddress?: string; userAgent?: string } = {};
    if (req.ip) context.ipAddress = req.ip;
    if (req.get('user-agent')) context.userAgent = req.get('user-agent')!;
    
    const { user, tokens } = await AuthService.login(email, password, context);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          customId: user.customId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
        },
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  });

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  static refresh = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Refresh token is required',
      });
    }
    
    const tokens = await AuthService.refreshToken(refreshToken);
    
    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  });

  /**
   * Logout user
   * POST /auth/logout
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const userId = req.user?._id.toString();
    
    if (!userId) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }
    
    const context: { ipAddress?: string; userAgent?: string } = {};
    if (req.ip) context.ipAddress = req.ip;
    if (req.get('user-agent')) context.userAgent = req.get('user-agent')!;
    
    await AuthService.logout(userId, refreshToken, context);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    return res.json({
      success: true,
      message: 'Logout successful',
    });
  });

  /**
   * Logout from all devices
   * POST /auth/logout-all
   */
  static logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?._id.toString();
    
    if (!userId) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }
    
    const context: { ipAddress?: string; userAgent?: string } = {};
    if (req.ip) context.ipAddress = req.ip;
    if (req.get('user-agent')) context.userAgent = req.get('user-agent')!;
    
    await AuthService.logout(userId, undefined, context);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    return res.json({
      success: true,
      message: 'Logged out from all devices',
    });
  });

  /**
   * Forgot password
   * POST /auth/forgot-password
   */
  static forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    
    await AuthService.forgotPassword(email);
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  });

  /**
   * Reset password
   * POST /auth/reset-password
   */
  static resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    
    await AuthService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  });

  /**
   * Change password (authenticated)
   * POST /auth/change-password
   */
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user?._id.toString();
    
    if (!userId) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }
    
    await AuthService.changePassword(userId, currentPassword, newPassword);
    
    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  /**
   * Verify email
   * POST /auth/verify-email
   */
  static verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { token } = verifyEmailSchema.parse(req.body);
    
    await AuthService.verifyEmail(token);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  });

  /**
   * Resend email verification
   * POST /auth/resend-verification
   */
  static resendVerification = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?._id.toString();
    
    if (!userId) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }
    
    await AuthService.resendEmailVerification(userId);
    
    return res.json({
      success: true,
      message: 'Verification email sent',
    });
  });

  /**
   * Get current user
   * GET /auth/me
   */
  static getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?._id.toString();
    
    if (!userId) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }
    
    const user = await AuthService.getCurrentUser(userId);
    
    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          customId: user.customId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  });
}
