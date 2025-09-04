import crypto from 'crypto';
import { OTP, OTPDocument } from '@/models/OTP';
import { EmailService } from './EmailService';
import { logger } from '@/config/logger';

export class OTPService {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send OTP for email verification during signup
   */
  static async sendSignupOTP(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    department?: string;
    currentLocation?: string;
    yearsOfExperience?: string;
  }): Promise<void> {
    try {
      // Generate OTP
      const otp = this.generateOTP();
      
      // Delete any existing OTP for this email
      await OTP.deleteMany({ email: userData.email });
      
      // Store OTP with user data
      const otpRecord = new OTP({
        email: userData.email,
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
   * Verify OTP and return user data if valid
   */
  static async verifyOTP(email: string, otp: string): Promise<OTPDocument['userData'] | null> {
    try {
      // Find OTP record
      const otpRecord = await OTP.findOne({ 
        email: email.toLowerCase().trim(),
        otp: otp 
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
   * Resend OTP for existing signup attempt
   */
  static async resendOTP(email: string): Promise<void> {
    try {
      // Find existing OTP record
      const existingOTP = await OTP.findOne({ email: email.toLowerCase().trim() });
      
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
   * Cleanup expired OTPs (can be called periodically)
   */
  static async cleanupExpiredOTPs(): Promise<number> {
    try {
      const result = await OTP.deleteMany({
        expiresAt: { $lt: new Date() }
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
