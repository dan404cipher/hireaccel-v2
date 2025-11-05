import crypto from 'crypto';
import { OTP, OTPDocument } from '@/models/OTP';
import { EmailService } from './EmailService';
import { SMSService } from './SMSService';
import { logger } from '@/config/logger';
import { env } from '@/config/env';

export class OTPService {
    /**
     * Check if test mode is enabled
     * @returns true if TEST_SMS environment variable is set to true
     */
    static isTestMode(): boolean {
        return env.TEST_SMS === true;
    }

    /**
     * Generate a 6-digit OTP
     * In test mode (TEST_SMS=true), returns "000000" for easy testing
     */
    static generateOTP(): string {
        // Use test OTP for development/testing when TEST_SMS is enabled
        if (env.TEST_SMS === true) {
            logger.warn('TEST_SMS enabled - using test OTP 000000. DISABLE IN PRODUCTION!');
            return '000000';
        }

        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Send OTP for email verification during signup
     * Note: When TEST_SMS=true, OTP will be "000000" for testing
     */
    static async sendSignupOTP(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
        source?: string; // Make optional for backward compatibility
        phone?: string;
        department?: string;
        currentLocation?: string;
        yearsOfExperience?: string;
    }): Promise<void> {
        try {
            // Generate OTP (will be "000000" if TEST_SMS=true)
            const otp = this.generateOTP();

            // Delete any existing OTP for this email
            await OTP.deleteMany({ email: userData.email });

            // Store OTP with user data
            const otpRecord = new OTP({
                email: userData.email,
                type: 'email',
                otp: otp,
                userData: userData,
                attempts: 0,
            });

            await otpRecord.save();

            // Send OTP via email
            await EmailService.sendOTP(userData.email, otp, userData.firstName);

            logger.info('Signup OTP sent successfully', {
                email: userData.email,
                role: userData.role,
            });
        } catch (error) {
            logger.error('Failed to send signup OTP', {
                email: userData.email,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Send SMS OTP for phone verification during signup
     * Note: When TEST_SMS=true, OTP will be "000000" for testing
     */
    static async sendSMSSignupOTP(userData: {
        phoneNumber: string;
        firstName: string;
        role: string;
        source?: string;
    }): Promise<void> {
        try {
            // Generate OTP (will be "000000" if TEST_SMS=true)
            const otp = this.generateOTP();

            // Delete any existing OTP for this phone number
            await OTP.deleteMany({ phoneNumber: userData.phoneNumber });

            // Store OTP with minimal user data for SMS signup
            const otpRecord = new OTP({
                phoneNumber: userData.phoneNumber,
                type: 'sms',
                otp: otp,
                userData: {
                    phoneNumber: userData.phoneNumber,
                    firstName: userData.firstName,
                    role: userData.role,
                    source: userData.source,
                },
                attempts: 0,
            });

            await otpRecord.save();

            // Send OTP via SMS
            await SMSService.sendOTP(userData.phoneNumber, otp, userData.firstName);

            logger.info('SMS Signup OTP sent successfully', {
                phoneNumber: userData.phoneNumber,
                role: userData.role,
            });
        } catch (error) {
            logger.error('Failed to send SMS signup OTP', {
                phoneNumber: userData.phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Verify OTP and return user data if valid (for email-based signup)
     */
    static async verifyOTP(email: string, otp: string): Promise<OTPDocument['userData'] | null> {
        try {
            // Find OTP record
            const otpRecord = await OTP.findOne({
                email: email.toLowerCase().trim(),
                otp: otp,
                type: 'email',
            });

            if (!otpRecord) {
                logger.warn('Invalid OTP attempt', {
                    email: email,
                    otp: otp,
                });
                return null;
            }

            // Check if OTP has expired
            if (otpRecord.expiresAt < new Date()) {
                logger.warn('Expired OTP attempt', {
                    email: email,
                    expiredAt: otpRecord.expiresAt,
                });
                await OTP.deleteOne({ _id: otpRecord._id });
                return null;
            }

            // Check attempt limit
            if (otpRecord.attempts >= 5) {
                logger.warn('OTP attempt limit exceeded', {
                    email: email,
                    attempts: otpRecord.attempts,
                });
                await OTP.deleteOne({ _id: otpRecord._id });
                return null;
            }

            // Increment attempts
            otpRecord.attempts += 1;
            await otpRecord.save();

            // If OTP is correct, return user data and delete OTP record
            const userData = otpRecord.userData;
            await OTP.deleteOne({ _id: otpRecord._id });

            logger.info('OTP verified successfully', {
                email: email,
                role: userData.role,
            });

            return userData;
        } catch (error) {
            logger.error('Failed to verify OTP', {
                email: email,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Verify SMS OTP and return user data if valid (for phone-based signup)
     */
    static async verifySMSOTP(phoneNumber: string, otp: string): Promise<OTPDocument['userData'] | null> {
        try {
            // Find OTP record
            const otpRecord = await OTP.findOne({
                phoneNumber: phoneNumber.trim(),
                otp: otp,
                type: 'sms',
            });

            if (!otpRecord) {
                logger.warn('Invalid SMS OTP attempt', {
                    phoneNumber: phoneNumber,
                    otp: otp,
                });
                return null;
            }

            // Check if OTP has expired
            if (otpRecord.expiresAt < new Date()) {
                logger.warn('Expired SMS OTP attempt', {
                    phoneNumber: phoneNumber,
                    expiredAt: otpRecord.expiresAt,
                });
                await OTP.deleteOne({ _id: otpRecord._id });
                return null;
            }

            // Check attempt limit
            if (otpRecord.attempts >= 5) {
                logger.warn('SMS OTP attempt limit exceeded', {
                    phoneNumber: phoneNumber,
                    attempts: otpRecord.attempts,
                });
                await OTP.deleteOne({ _id: otpRecord._id });
                return null;
            }

            // Increment attempts
            otpRecord.attempts += 1;
            await otpRecord.save();

            // If OTP is correct, return user data and delete OTP record
            const userData = otpRecord.userData;
            await OTP.deleteOne({ _id: otpRecord._id });

            logger.info('SMS OTP verified successfully', {
                phoneNumber: phoneNumber,
                role: userData.role,
            });

            return userData;
        } catch (error) {
            logger.error('Failed to verify SMS OTP', {
                phoneNumber: phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Resend OTP for existing email signup attempt
     */
    static async resendOTP(email: string): Promise<void> {
        try {
            // Find existing OTP record
            const existingOTP = await OTP.findOne({
                email: email.toLowerCase().trim(),
                type: 'email',
            });

            if (!existingOTP) {
                throw new Error('No pending signup found for this email');
            }

            // Generate new OTP
            const newOTP = this.generateOTP();

            // Update the record
            existingOTP.otp = newOTP;
            existingOTP.attempts = 0;
            existingOTP.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await existingOTP.save();

            // Send new OTP
            await EmailService.sendOTP(email, newOTP, existingOTP.userData.firstName);

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
     * Resend SMS OTP for existing phone signup attempt
     */
    static async resendSMSOTP(phoneNumber: string): Promise<void> {
        try {
            // Find existing OTP record
            const existingOTP = await OTP.findOne({
                phoneNumber: phoneNumber.trim(),
                type: 'sms',
            });

            if (!existingOTP) {
                throw new Error('No pending signup found for this phone number');
            }

            // Generate new OTP
            const newOTP = this.generateOTP();

            // Update the record
            existingOTP.otp = newOTP;
            existingOTP.attempts = 0;
            existingOTP.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await existingOTP.save();

            // Send new OTP via SMS
            await SMSService.sendOTP(phoneNumber, newOTP, existingOTP.userData.firstName);

            logger.info('SMS OTP resent successfully', {
                phoneNumber: phoneNumber,
            });
        } catch (error) {
            logger.error('Failed to resend SMS OTP', {
                phoneNumber: phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Cleanup expired OTPs (can be called periodically)
     */
    static async cleanupExpiredOTPs(): Promise<number> {
        try {
            const result = await OTP.deleteMany({
                expiresAt: { $lt: new Date() },
            });

            logger.info('Cleaned up expired OTPs', {
                deletedCount: result.deletedCount,
            });

            return result.deletedCount || 0;
        } catch (error) {
            logger.error('Failed to cleanup expired OTPs', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return 0;
        }
    }
}
