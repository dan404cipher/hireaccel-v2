import argon2 from 'argon2';
import { logger } from '@/config/logger';

/**
 * Password hashing and validation utilities using Argon2
 * Argon2 is the winner of the Password Hashing Competition and is recommended for new applications
 */

/**
 * Argon2 configuration options
 * These settings provide a good balance between security and performance
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id, // Argon2id is resistant to both side-channel and GPU attacks
  memoryCost: 2 ** 16,   // 64 MB memory usage
  timeCost: 3,           // 3 iterations
  parallelism: 1,        // Single thread
  hashLength: 50,        // 50 byte hash length
};

/**
 * Hash a password using Argon2
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Validate password strength before hashing
    validatePasswordStrength(password);
    
    const hashedPassword = await argon2.hash(password, ARGON2_OPTIONS);
    
    logger.debug('Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    logger.error('Error hashing password', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw new Error('Password hashing failed');
  }
};

/**
 * Verify a password against its hash
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isValid = await argon2.verify(hashedPassword, password);
    
    logger.debug('Password verification completed', { isValid });
    return isValid;
  } catch (error) {
    logger.error('Error verifying password', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
};

/**
 * Check if password hash needs rehashing (e.g., if security parameters changed)
 */
export const needsRehash = (hashedPassword: string): boolean => {
  try {
    return argon2.needsRehash(hashedPassword, ARGON2_OPTIONS);
  } catch (error) {
    logger.warn('Error checking if password needs rehash', { error });
    return true; // Err on the side of caution
  }
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): void => {
  const errors: string[] = [];
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }
  
  // Character set checks
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Common password checks
  if (isCommonPassword(password)) {
    errors.push('Password is too common, please choose a different one');
  }
  
  // Repeated character checks (disabled for easier signup)
  // if (hasRepeatedCharacters(password)) {
  //   errors.push('Password cannot contain more than 3 repeated characters');
  // }
  
  if (errors.length > 0) {
    throw new Error(`Password validation failed: ${errors.join(', ')}`);
  }
};

/**
 * Check if password is in list of common passwords
 */
const isCommonPassword = (password: string): boolean => {
  // List of common passwords to reject
  const commonPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty',
    'abc123', 'password1', 'admin', 'letmein', 'welcome',
    '12345678', 'monkey', '1234567890', 'dragon', 'master',
    'baseball', 'football', 'basketball', 'superman', 'batman',
    'trustno1', 'hello', 'welcome123', 'admin123', 'root',
    'test', 'guest', 'user', 'demo', 'temp', 'temporary'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};


/**
 * Check for repeated characters (e.g., aaaa, 1111)
 */
const hasRepeatedCharacters = (password: string): boolean => {
  let count = 1;
  let maxCount = 1;
  
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      count++;
      maxCount = Math.max(maxCount, count);
    } else {
      count = 1;
    }
  }
  
  return maxCount > 3;
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Ensure we have at least one character from each set
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters from all sets
  const allChars = lowercase + uppercase + digits + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Calculate password strength score (0-100)
 */
export const calculatePasswordStrength = (password: string): {
  score: number;
  level: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];
  
  // Length scoring
  if (password.length >= 8) score += 20;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 10;
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security');
  
  if (password.length >= 16) score += 10;
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters');
  
  // Pattern scoring
  if (!hasRepeatedCharacters(password)) score += 10;
  else feedback.push('Avoid repeated characters');
  
  if (!isCommonPassword(password)) score += 15;
  else feedback.push('Avoid common passwords');
  
  // Determine strength level
  let level: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
  if (score < 30) level = 'very_weak';
  else if (score < 50) level = 'weak';
  else if (score < 70) level = 'fair';
  else if (score < 90) level = 'good';
  else level = 'strong';
  
  return { score, level, feedback };
};

/**
 * Secure password comparison with timing attack protection
 */
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash password reset token for storage
 */
export const hashPasswordResetToken = (token: string): string => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Validate password reset token expiration
 */
export const isPasswordResetTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * Generate temporary password for new users
 */
export const generateTemporaryPassword = (): string => {
  // Generate a secure password that meets all requirements
  return generateSecurePassword(12);
};

/**
 * Check if password was recently used (for password history)
 */
export const wasPasswordRecentlyUsed = async (
  newPassword: string,
  passwordHistory: string[]
): Promise<boolean> => {
  try {
    for (const oldHashedPassword of passwordHistory) {
      if (await verifyPassword(newPassword, oldHashedPassword)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    logger.error('Error checking password history', { error });
    return false;
  }
};

/**
 * Password change helper that validates new password against history
 */
export const validatePasswordChange = async (
  currentPassword: string,
  newPassword: string,
  currentHashedPassword: string,
  passwordHistory: string[] = []
): Promise<void> => {
  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(currentPassword, currentHashedPassword);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Check if new password is the same as current
  if (currentPassword === newPassword) {
    throw new Error('New password must be different from current password');
  }
  
  // Validate new password strength
  validatePasswordStrength(newPassword);
  
  // Check password history
  const wasUsedRecently = await wasPasswordRecentlyUsed(newPassword, passwordHistory);
  if (wasUsedRecently) {
    throw new Error('Password was recently used. Please choose a different password.');
  }
};
