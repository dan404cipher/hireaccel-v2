import { User, UserDocument } from '@/models/User';
import { Candidate } from '@/models/Candidate';
import { AuditLog } from '@/models/AuditLog';
import { OTPService } from './OTPService';
import { EmailService } from './EmailService';
import { generateCustomUserId } from '@/utils/customId';
import { UserRole, UserStatus, AuthTokens, AuditAction } from '@/types';
import { 
  hashPassword, 
  verifyPassword, 
  generatePasswordResetToken,
  hashPasswordResetToken,
  validatePasswordStrength,
  generateTemporaryPassword 
} from '@/utils/password';
import { 
  generateTokenPair, 
  verifyRefreshToken, 
  blacklistToken,
  generateSecureToken 
} from '@/utils/jwt';
import { 
  createUnauthorizedError, 
  createBadRequestError, 
  createNotFoundError,
  createConflictError 
} from '@/middleware/errorHandler';
import { logger } from '@/config/logger';

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
export class AuthService {
  /**
   * Send OTP for user registration
   */
  static async sendRegistrationOTP(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string | undefined;
    department?: string | undefined;
    currentLocation?: string | undefined;
    yearsOfExperience?: string | undefined;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw createConflictError('User with this email already exists');
      }
      
      // Validate password strength
      validatePasswordStrength(userData.password);
      
      // Send OTP
      await OTPService.sendSignupOTP({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        ...(userData.phone && { phone: userData.phone }),
        ...(userData.department && { department: userData.department }),
        ...(userData.currentLocation && { currentLocation: userData.currentLocation }),
        ...(userData.yearsOfExperience && { yearsOfExperience: userData.yearsOfExperience }),
      });
      
      logger.info('Registration OTP sent successfully', {
        email: userData.email,
        role: userData.role,
      });
      
      return {
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
      };
    } catch (error) {
      logger.error('Failed to send registration OTP', {
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify OTP and complete user registration
   */
  static async verifyOTPAndRegister(
    email: string, 
    otp: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{ user: UserDocument; tokens: AuthTokens }> {
    try {
      // Verify OTP and get user data
      const userData = await OTPService.verifyOTP(email, otp);
      if (!userData) {
        throw createBadRequestError('Invalid or expired OTP');
      }
      
      // Check if user was created in the meantime
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw createConflictError('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Generate custom user ID based on role
      let customId: string;
      try {
        customId = await generateCustomUserId(userData.role as UserRole);
        logger.info('Generated custom user ID', {
          email: userData.email,
          role: userData.role,
          customId: customId,
        });
      } catch (error) {
        logger.error('Failed to generate custom user ID', {
          email: userData.email,
          role: userData.role,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw createBadRequestError('Failed to generate user ID');
      }
      
      // Create user
      const user = new User({
        email: userData.email,
        customId: customId,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as UserRole,
        status: UserStatus.ACTIVE, // User is verified via OTP
        emailVerified: true, // Email is verified via OTP
      });
      
      await user.save();
      
      // Create candidate profile if user is registering as a candidate
      if (userData.role === UserRole.CANDIDATE) {
        const candidate = new Candidate({
          userId: user._id,
          profile: {
            summary: '',
            skills: [],
            experience: [],
            education: [],
            certifications: [],
            projects: [],
            location: userData.currentLocation || '',
            phoneNumber: userData.phone || '',
            preferredSalaryRange: {
              min: 0,
              max: 0,
              currency: 'USD'
            },
            availability: {
              startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
              remote: false,
              relocation: false
            }
          }
        });
        
        await candidate.save();
        
        logger.info('Candidate profile created successfully', {
          userId: user._id,
          candidateId: candidate._id,
        });
      }
      
      // Generate tokens
      const tokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      
      // Store refresh token
      user.addRefreshToken(
        tokens.refreshToken,
        context?.userAgent,
        context?.ipAddress
      );
      await user.save();
      
      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(user.email, user.firstName, user.customId);
      } catch (error) {
        logger.warn('Failed to send welcome email', { error });
      }
      
      // Log registration
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.CREATE,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          role: user.role,
          registrationMethod: 'email_otp',
        },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        businessProcess: 'authentication',
      });
      
      logger.info('User registered successfully via OTP', {
        userId: user._id,
        email: user.email,
        role: user.role,
        customId: user.customId,
      });
      
      return { user, tokens };
    } catch (error) {
      logger.error('OTP verification and registration failed', {
        email: email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Register a new user (Now uses OTP flow)
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string | undefined;
    department?: string | undefined;
    currentLocation?: string | undefined;
    yearsOfExperience?: string | undefined;
  }): Promise<{ success: boolean; message: string; requiresOTP: boolean }> {
    // Redirect to OTP flow
    const result = await this.sendRegistrationOTP(userData);
    return {
      ...result,
      requiresOTP: true,
    };
  }

  /**
   * Resend OTP for registration
   */
  static async resendOTP(email: string): Promise<void> {
    try {
      await OTPService.resendOTP(email);
      
      logger.info('OTP resent successfully', {
        email: email,
      });
    } catch (error) {
      logger.error('Failed to resend OTP', {
        email: email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Login user
   */
  static async login(
    email: string, 
    password: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{ user: UserDocument; tokens: AuthTokens }> {
    try {
      // Find user with password field
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password +refreshTokens');
      
      if (!user) {
        throw createUnauthorizedError('Invalid email or password');
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        // Log failed login attempt
        await AuditLog.createLog({
          actor: user._id,
          action: AuditAction.LOGIN,
          entityType: 'User',
          entityId: user._id,
          metadata: {
            success: false,
            reason: 'invalid_password',
          },
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent,
          businessProcess: 'authentication',
          success: false,
          errorMessage: 'Invalid password',
        });
        
        throw createUnauthorizedError('Invalid email or password');
      }
      
      // Check account status
      if (user.status === UserStatus.SUSPENDED) {
        throw createUnauthorizedError('Account is suspended. Please contact support.');
      }
      
      if (user.status === UserStatus.INACTIVE) {
        throw createUnauthorizedError('Account is inactive. Please contact administrator.');
      }
      
      // Generate tokens
      const tokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      
      // Store refresh token
      user.addRefreshToken(
        tokens.refreshToken,
        context?.userAgent,
        context?.ipAddress
      );
      
      // Update last login
      user.updateLastLogin();
      
      await user.save();
      
      // Log successful login
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.LOGIN,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          success: true,
          lastLogin: user.lastLoginAt,
        },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        businessProcess: 'authentication',
      });
      
      logger.info('User logged in successfully', {
        userId: user._id,
        email: user.email,
        role: user.role,
      });
      
      return { user, tokens };
    } catch (error) {
      logger.warn('Login attempt failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(decoded.userId).select('+refreshTokens');
      if (!user) {
        throw createUnauthorizedError('User not found');
      }
      
      // Check if refresh token exists in user's stored tokens
      const storedToken = user.refreshTokens?.find(rt => rt.token === refreshToken);
      if (!storedToken) {
        throw createUnauthorizedError('Invalid refresh token');
      }
      
      // Check account status
      if (user.status !== UserStatus.ACTIVE) {
        throw createUnauthorizedError('Account is not active');
      }
      
      // Generate new tokens
      const newTokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      
      // Remove old refresh token and add new one
      user.removeRefreshToken(refreshToken);
      user.addRefreshToken(newTokens.refreshToken);
      
      await user.save();
      
      logger.debug('Tokens refreshed successfully', {
        userId: user._id,
      });
      
      return newTokens;
    } catch (error) {
      logger.warn('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Logout user
   */
  static async logout(
    userId: string, 
    refreshToken?: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+refreshTokens');
      if (!user) {
        throw createNotFoundError('User', userId);
      }
      
      if (refreshToken) {
        // Remove specific refresh token
        user.removeRefreshToken(refreshToken);
        blacklistToken(refreshToken);
      } else {
        // Remove all refresh tokens (logout from all devices)
        user.removeAllRefreshTokens();
      }
      
      await user.save();
      
      // Log logout
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.LOGOUT,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          logoutType: refreshToken ? 'single_device' : 'all_devices',
        },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        businessProcess: 'authentication',
      });
      
      logger.info('User logged out successfully', {
        userId: user._id,
        logoutType: refreshToken ? 'single_device' : 'all_devices',
      });
    } catch (error) {
      logger.error('Logout failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Initiate password reset
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        logger.warn('Password reset requested for non-existent email', { email });
        return;
      }
      
      // Generate reset token
      const resetToken = generatePasswordResetToken();
      const hashedToken = hashPasswordResetToken(resetToken);
      
      // Set reset token and expiration (1 hour)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      
      await user.save();
      
      // Log password reset request
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          action: 'password_reset_requested',
        },
        businessProcess: 'authentication',
        riskLevel: 'medium',
      });
      
      logger.info('Password reset token generated', {
        userId: user._id,
        email: user.email,
      });
      
      // Send password reset email
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken
      );
      
    } catch (error) {
      logger.error('Password reset initiation failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string, 
    newPassword: string
  ): Promise<void> {
    try {
      const hashedToken = hashPasswordResetToken(token);
      
      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+resetPasswordToken +resetPasswordExpires');
      
      if (!user) {
        throw createBadRequestError('Invalid or expired reset token');
      }
      
      // Validate new password
      validatePasswordStrength(newPassword);
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password and clear reset token
      user.password = hashedPassword;
      delete user.resetPasswordToken;
      delete user.resetPasswordExpires;
      
      // Remove all refresh tokens (force re-login)
      user.removeAllRefreshTokens();
      
      await user.save();
      
      // Log password reset
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          action: 'password_reset_completed',
        },
        businessProcess: 'authentication',
        riskLevel: 'high',
      });
      
      logger.info('Password reset completed', {
        userId: user._id,
        email: user.email,
      });
      
      // TODO: Send password reset confirmation email
      
    } catch (error) {
      logger.error('Password reset failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      const hashedToken = hashPasswordResetToken(token);
      
      // Find user with valid verification token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      }).select('+emailVerificationToken +emailVerificationExpires');
      
      if (!user) {
        throw createBadRequestError('Invalid or expired verification token');
      }
      
      // Mark email as verified and activate account
      user.emailVerified = true;
      user.status = UserStatus.ACTIVE;
      delete user.emailVerificationToken;
      delete user.emailVerificationExpires;
      
      await user.save();
      
      // Log email verification
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          action: 'email_verified',
        },
        businessProcess: 'authentication',
      });
      
      logger.info('Email verified successfully', {
        userId: user._id,
        email: user.email,
      });
      
    } catch (error) {
      logger.error('Email verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Resend email verification
   */
  static async resendEmailVerification(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId)
        .select('+emailVerificationToken +emailVerificationExpires');
      
      if (!user) {
        throw createNotFoundError('User', userId);
      }
      
      if (user.emailVerified) {
        throw createBadRequestError('Email is already verified');
      }
      
      // Generate new verification token
      const verificationToken = generateSecureToken();
      user.emailVerificationToken = hashPasswordResetToken(verificationToken);
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await user.save();
      
      logger.info('Email verification resent', {
        userId: user._id,
        email: user.email,
      });
      
      // TODO: Send email verification email with verificationToken
      
    } catch (error) {
      logger.error('Resend email verification failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Change password (when user is authenticated)
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password +refreshTokens');
      if (!user) {
        throw createNotFoundError('User', userId);
      }
      
      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw createUnauthorizedError('Current password is incorrect');
      }
      
      // Validate new password
      validatePasswordStrength(newPassword);
      
      // Check if new password is different from current
      const isSamePassword = await verifyPassword(newPassword, user.password);
      if (isSamePassword) {
        throw createBadRequestError('New password must be different from current password');
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      
      // Remove all refresh tokens except current session
      // TODO: Implement session management to keep current session active
      
      await user.save();
      
      // Log password change
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          action: 'password_changed',
        },
        businessProcess: 'authentication',
        riskLevel: 'medium',
      });
      
      logger.info('Password changed successfully', {
        userId: user._id,
        email: user.email,
      });
      
      // TODO: Send password change notification email
      
    } catch (error) {
      logger.error('Password change failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<UserDocument> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createNotFoundError('User', userId);
      }
      
      return user;
    } catch (error) {
      logger.error('Get current user failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Create admin user (for initial setup)
   */
  static async createAdminUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
  }): Promise<{ user: UserDocument; temporaryPassword?: string }> {
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
      if (existingAdmin) {
        throw createConflictError('Admin user already exists');
      }
      
      const password = userData.password || generateTemporaryPassword();
      const hashedPassword = await hashPassword(password);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true, // Admin doesn't need email verification
      });
      
      await user.save();
      
      // Log admin creation
      await AuditLog.createLog({
        actor: user._id,
        action: AuditAction.CREATE,
        entityType: 'User',
        entityId: user._id,
        metadata: {
          role: UserRole.ADMIN,
          setupType: 'initial_admin',
        },
        businessProcess: 'system_administration',
        riskLevel: 'critical',
      });
      
      logger.info('Admin user created', {
        userId: user._id,
        email: user.email,
      });
      
      const result: { user: UserDocument; temporaryPassword?: string } = { user };
      if (!userData.password) {
        result.temporaryPassword = password;
      }
      return result;
    } catch (error) {
      logger.error('Admin user creation failed', {
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
