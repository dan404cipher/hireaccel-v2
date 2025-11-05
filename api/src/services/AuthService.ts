import { User, UserDocument } from '@/models/User';
import { Lead } from '@/models/Lead';
import { Candidate } from '@/models/Candidate';
import { AuditLog } from '@/models/AuditLog';
import { OTPService } from './OTPService';
import { EmailService } from './EmailService';
import { SMSService } from './SMSService';
import { GoogleSheetsService } from './GoogleSheetsService';
import { generateCustomUserId } from '@/utils/customId';
import { UserRole, UserStatus, AuthTokens, AuditAction } from '@/types';
import {
    hashPassword,
    verifyPassword,
    generatePasswordResetToken,
    hashPasswordResetToken,
    validatePasswordStrength,
    generateTemporaryPassword,
} from '@/utils/password';
import {
    generateTokenPair,
    verifyRefreshToken,
    blacklistToken,
    generateSecureToken,
    generateLeadToken,
    verifyLeadToken,
} from '@/utils/jwt';
import {
    createBadRequestError,
    createConflictError,
    createNotFoundError,
    createUnauthorizedError,
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
        source?: string; // Make optional for backward compatibility
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
                ...(userData.source && { source: userData.source }),
                ...(userData.phone && { phoneNumber: userData.phone }),
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
        },
    ): Promise<{ user: UserDocument; tokens: AuthTokens }> {
        try {
            // Verify OTP and get user data
            const userData = await OTPService.verifyOTP(email, otp);
            if (!userData) {
                throw createBadRequestError('Invalid or expired OTP');
            }

            // Check if user was created in the meantime
            if (!userData.email) {
                throw createBadRequestError('Email is required');
            }
            if (!userData.password) {
                throw createBadRequestError('Password is required');
            }

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
                phoneNumber: userData.phoneNumber, // Save phone number
                ...(userData.source && { source: userData.source }), // Save source if provided
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
                        phoneNumber: userData.phoneNumber || '',
                        preferredSalaryRange: {
                            min: 0,
                            max: 0,
                            currency: 'USD',
                        },
                        availability: {
                            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                            remote: false,
                            relocation: false,
                        },
                    },
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
                ...(user.email && { email: user.email }),
                ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
                role: user.role,
            });

            // Store refresh token
            user.addRefreshToken(tokens.refreshToken, context?.userAgent, context?.ipAddress);
            await user.save();

            // Send welcome email (only if email exists)
            if (user.email) {
                try {
                    await EmailService.sendWelcomeEmail(user.email, user.firstName, user.customId);
                } catch (error) {
                    logger.warn('Failed to send welcome email', { error });
                }
            }

            // Submit registration data to Google Sheets
            try {
                const formData: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    role: UserRole;
                    phone?: string;
                    department?: string;
                    currentLocation?: string;
                    yearsOfExperience?: string;
                } = {
                    email: user.email || '', // Handle optional email
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                };

                // Phone number handling: userData structure varies between email and SMS signup
                // if (userData.phone) formData.phone = userData.phone
                if (userData.department) formData.department = userData.department;
                if (userData.currentLocation) formData.currentLocation = userData.currentLocation;
                if (userData.yearsOfExperience) formData.yearsOfExperience = userData.yearsOfExperience;

                await GoogleSheetsService.submitRegistrationData(formData);
            } catch (error) {
                logger.warn('Failed to submit registration data to Google Sheets', { error });
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
     * Verify SMS OTP and mark lead as verified (Step 2: OTP Verification)
     */
    static async verifySMSOTPAndRegister(
        phoneNumber: string,
        otp: string,
        _context?: {
            ipAddress?: string;
            userAgent?: string;
        },
    ): Promise<{ leadId: string; tempToken: string; phoneNumber: string; role: string; nextStep: string }> {
        try {
            // Verify SMS OTP
            const userData = await OTPService.verifySMSOTP(phoneNumber, otp);
            if (!userData) {
                throw createBadRequestError('Invalid or expired OTP');
            }

            // Find the lead
            const lead = await Lead.findByPhoneNumber(phoneNumber);
            if (!lead) {
                throw createNotFoundError('Lead not found. Please restart registration.');
            }

            // Check if already verified
            if (lead.isPhoneVerified) {
                // Return existing temp token
                const tempToken = generateLeadToken({
                    leadId: lead._id.toString(),
                    phoneNumber: lead.phoneNumber,
                    role: lead.role,
                });

                return {
                    leadId: lead._id.toString(),
                    tempToken,
                    phoneNumber: lead.phoneNumber,
                    role: lead.role,
                    nextStep: 'email_setup',
                };
            }

            // Mark lead as verified
            lead.isPhoneVerified = true;
            await lead.save();

            logger.info('SMS OTP verified successfully', {
                leadId: lead._id,
                phoneNumber: lead.phoneNumber,
            });

            // Generate temporary token for completing registration
            const tempToken = generateLeadToken({
                leadId: lead._id.toString(),
                phoneNumber: lead.phoneNumber,
                role: lead.role,
            });

            return {
                leadId: lead._id.toString(),
                tempToken,
                phoneNumber: lead.phoneNumber,
                role: lead.role,
                nextStep: 'email_setup',
            };
        } catch (error) {
            logger.error('SMS OTP verification failed', {
                phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Resend SMS OTP
     */
    static async resendSMSOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
        try {
            await OTPService.resendSMSOTP(phoneNumber);
            return {
                success: true,
                message: 'OTP has been resent to your mobile number.',
            };
        } catch (error) {
            logger.error('SMS OTP resend failed', {
                phoneNumber: phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Complete registration by adding email and password (Step 3: Create User)
     */
    static async completeRegistration(
        leadToken: string,
        data: {
            email: string;
            password: string;
        },
        context?: {
            ipAddress?: string;
            userAgent?: string;
        },
    ): Promise<{ user: UserDocument; tokens: AuthTokens }> {
        try {
            // Verify lead token
            const decoded = verifyLeadToken(leadToken);

            // Find the verified lead
            const lead = await Lead.findById(decoded.leadId);
            if (!lead) {
                throw createNotFoundError('Lead not found. Registration expired.');
            }

            if (!lead.isPhoneVerified) {
                throw createBadRequestError('Phone number not verified. Please complete OTP verification first.');
            }

            // Check if user already exists with this phone number
            const existingUserByPhone = await User.findByPhoneNumber(lead.phoneNumber);
            if (existingUserByPhone) {
                throw createConflictError('An account with this phone number already exists');
            }

            // Check if email already exists
            const existingUserByEmail = await User.findByEmail(data.email);
            if (existingUserByEmail) {
                throw createConflictError(`An account with email '${data.email}' already exists`);
            }

            // Validate password strength (throws if invalid)
            validatePasswordStrength(data.password);

            // Hash password
            const hashedPassword = await hashPassword(data.password);

            // Generate custom user ID
            const customId = await generateCustomUserId(lead.role as UserRole);

            // Split name into first and last
            const nameParts = lead.name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || firstName;

            // Create user
            const user = new User({
                email: data.email,
                phoneNumber: lead.phoneNumber,
                password: hashedPassword,
                customId,
                firstName,
                lastName,
                role: lead.role,
                status: UserStatus.ACTIVE,
                emailVerified: false,
                source: lead.source,
                ...(lead.utmData && { utmData: lead.utmData }),
            });

            await user.save();

            logger.info('User created successfully from lead', {
                userId: user._id,
                leadId: lead._id,
                phoneNumber: lead.phoneNumber,
                email: data.email,
                role: user.role,
            });

            // If candidate, create candidate profile
            if (user.role === UserRole.CANDIDATE) {
                const candidate = new Candidate({
                    userId: user._id,
                    profile: {
                        summary: '',
                        skills: [],
                        experience: [],
                        education: [],
                        certifications: [],
                        projects: [],
                        location: '',
                        phoneNumber: lead.phoneNumber,
                        preferredSalaryRange: {
                            min: 0,
                            max: 0,
                            currency: 'USD',
                        },
                        availability: {
                            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                            remote: false,
                            relocation: false,
                        },
                    },
                });

                await candidate.save();

                logger.info('Candidate profile created successfully', {
                    userId: user._id,
                    candidateId: candidate._id,
                });
            }

            // Keep lead for logging/analytics (stored permanently)
            // Store email in lead for complete funnel tracking
            lead.email = data.email;
            await lead.save();

            logger.info('Lead updated with email for logging', {
                leadId: lead._id,
                email: data.email,
            });

            // Generate tokens
            const tokens = generateTokenPair({
                userId: user._id.toString(),
                email: user.email!,
                phoneNumber: user.phoneNumber!,
                role: user.role,
            });

            // Store refresh token
            user.addRefreshToken(tokens.refreshToken, context?.userAgent, context?.ipAddress);
            await user.save();

            // Log registration
            await AuditLog.createLog({
                actor: user._id,
                action: AuditAction.CREATE,
                entityType: 'User',
                entityId: user._id,
                metadata: {
                    role: user.role,
                    registrationMethod: 'sms_lead_completion',
                },
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
                businessProcess: 'authentication',
            });

            logger.info('Registration completed successfully', {
                userId: user._id,
                email: data.email,
                phoneNumber: lead.phoneNumber,
                role: user.role,
            });

            // Submit to Google Sheets
            try {
                await GoogleSheetsService.submitRegistrationData({
                    firstName: firstName || 'N/A',
                    lastName: lastName || 'N/A',
                    email: data.email,
                    phone: lead.phoneNumber,
                    role: user.role,
                });
            } catch (sheetError) {
                logger.warn('Failed to submit to Google Sheets', { error: sheetError });
            }

            return { user, tokens };
        } catch (error) {
            logger.error('Registration completion failed', {
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
        source?: string; // Make optional for backward compatibility
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
     * Send SMS OTP for phone-based registration (Step 1: Create Lead)
     */
    static async sendSMSRegistrationOTP(userData: {
        phoneNumber: string;
        name: string;
        role: UserRole;
        source?: string;
        utmData?: {
            utm_source?: string | undefined;
            utm_medium?: string | undefined;
            utm_campaign?: string | undefined;
            utm_content?: string | undefined;
            utm_term?: string | undefined;
            referrer?: string | undefined;
            landing_page?: string | undefined;
        };
    }): Promise<{ success: boolean; message: string }> {
        try {
            // Format phone number
            const formattedPhone = SMSService.formatPhoneNumber(userData.phoneNumber);

            // Validate phone number
            if (!SMSService.validatePhoneNumber(formattedPhone)) {
                throw createBadRequestError('Invalid phone number format');
            }

            // Check if user already exists with this phone number
            const existingUser = await User.findByPhoneNumber(formattedPhone);
            if (existingUser) {
                throw createConflictError('An account with this phone number already exists');
            }

            // Create or update lead (upsert - allows re-registration if unverified)
            // Leads are just for logging, not blocking registration
            const lead = await Lead.findOneAndUpdate(
                { phoneNumber: formattedPhone },
                {
                    name: userData.name,
                    phoneNumber: formattedPhone,
                    role: userData.role,
                    ...(userData.source && { source: userData.source }),
                    ...(userData.utmData && {
                        utmData: {
                            ...userData.utmData,
                            captured_at: new Date(),
                        },
                    }),
                    isPhoneVerified: false, // Reset verification status
                },
                { upsert: true, new: true },
            );

            // Send SMS OTP
            await OTPService.sendSMSSignupOTP({
                phoneNumber: formattedPhone,
                firstName: userData.name?.split(' ')[0] || 'User', // Use first word as firstName
                role: userData.role,
                ...(userData.source && { source: userData.source }),
            });

            logger.info('Lead created and OTP sent', { leadId: lead._id, phoneNumber: formattedPhone });

            return {
                success: true,
                message: 'OTP sent to your mobile number successfully',
            };
        } catch (error) {
            logger.error('SMS registration OTP sending failed', {
                phoneNumber: userData.phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Register user via SMS OTP (simplified flow)
     */
    static async registerViaSMS(userData: {
        phoneNumber: string;
        firstName: string;
        role: UserRole;
        source?: string;
    }): Promise<{ success: boolean; message: string; requiresOTP: boolean }> {
        // Send SMS OTP
        const result = await this.sendSMSRegistrationOTP({
            phoneNumber: userData.phoneNumber,
            name: userData.firstName,
            role: userData.role,
            ...(userData.source && { source: userData.source }),
        });
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
     * Login user with email OR phone number
     */
    static async login(
        identifier: string,
        password: string,
        context?: {
            ipAddress?: string;
            userAgent?: string;
        },
    ): Promise<{ user: UserDocument; tokens: AuthTokens }> {
        try {
            // Detect if identifier is email or phone number
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

            let user: UserDocument | null = null;
            let loginType: 'email' | 'phone' = 'email';

            if (emailRegex.test(identifier)) {
                // Identifier is an email
                user = await User.findOne({ email: identifier.toLowerCase() }).select('+password +refreshTokens');
                loginType = 'email';
            } else if (phoneRegex.test(identifier.replace(/[\s\-()]/g, ''))) {
                // Identifier is a phone number - format and search
                const formattedPhone = SMSService.formatPhoneNumber(identifier);
                user = await User.findOne({ phoneNumber: formattedPhone }).select('+password +refreshTokens');
                loginType = 'phone';
            } else {
                // Try both as fallback
                user = await User.findOne({
                    $or: [{ email: identifier.toLowerCase() }, { phoneNumber: identifier }],
                }).select('+password +refreshTokens');
            }

            if (!user) {
                throw createUnauthorizedError('Invalid credentials');
            }

            // Check if user has a password (required for login)
            if (!user.password) {
                throw createUnauthorizedError(
                    'This account does not have a password set. Please use SMS authentication or reset your password.',
                );
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
                        loginType,
                    },
                    ipAddress: context?.ipAddress,
                    userAgent: context?.userAgent,
                    businessProcess: 'authentication',
                    success: false,
                    errorMessage: 'Invalid password',
                });

                throw createUnauthorizedError('Invalid credentials');
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
                ...(user.email && { email: user.email }),
                ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
                role: user.role,
            });

            // Store refresh token
            user.addRefreshToken(tokens.refreshToken, context?.userAgent, context?.ipAddress);

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
                    loginType,
                },
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
                businessProcess: 'authentication',
            });

            logger.info('User logged in successfully', {
                userId: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                loginType,
                role: user.role,
            });

            return { user, tokens };
        } catch (error) {
            logger.warn('Login attempt failed', {
                identifier,
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

            // Check if refresh token exists in user's stored tokens (supports hashed + legacy)
            const { hashToken } = await import('@/utils/jwt');
            const hashed = hashToken(refreshToken);
            const storedToken = user.refreshTokens?.find((rt) => rt.token === hashed || rt.token === refreshToken);
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
                ...(user.email && { email: user.email }),
                ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
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
        },
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
            if (user.email) {
                await EmailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
            }
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
    static async resetPassword(token: string, newPassword: string): Promise<void> {
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
            const user = await User.findById(userId).select('+emailVerificationToken +emailVerificationExpires');

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
    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        try {
            const user = await User.findById(userId).select('+password +refreshTokens');
            if (!user) {
                throw createNotFoundError('User', userId);
            }

            // Check if user has a password (SMS-only users can't change password this way)
            if (!user.password) {
                throw createBadRequestError('This account uses SMS authentication and does not have a password');
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

    /**
     * Add email and password to existing phone-based account
     */
    static async addEmailToAccount(userId: string, email: string, password: string): Promise<{ user: UserDocument }> {
        try {
            // Check if email is already taken
            const existingUserWithEmail = await User.findByEmail(email);
            if (existingUserWithEmail) {
                throw createConflictError('Email is already registered with another account');
            }

            // Find user by ID
            const user = await User.findById(userId);
            if (!user) {
                throw createNotFoundError('User not found');
            }

            // Validate password strength
            validatePasswordStrength(password);

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Update user with email and password
            user.email = email.toLowerCase();
            user.password = hashedPassword;
            user.emailVerified = true; // Consider it verified since user is already authenticated

            await user.save();

            logger.info('Email added to phone-based account', {
                userId: user._id,
                email: email,
            });

            // Send welcome email
            try {
                await EmailService.sendWelcomeEmail(user.email!, user.firstName, user.customId);
            } catch (error) {
                logger.warn('Failed to send welcome email after adding email', { error });
            }

            return { user };
        } catch (error) {
            logger.error('Failed to add email to account', {
                userId: userId,
                email: email,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
}
