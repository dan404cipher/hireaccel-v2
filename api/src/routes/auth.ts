import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { authenticate } from '@/middleware/auth';
import { otpLimiter, refreshLimiter, loginLimiter } from '@/config/rateLimit';
import { csrfProtection, csrfProtectionEnabled } from '@/config/csrf';

/**
 * Authentication routes
 * Handles user registration, login, password management, etc.
 */

const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', otpLimiter, AuthController.register);

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP and complete registration
 * @access  Public
 */
router.post('/verify-otp', otpLimiter, AuthController.verifyOTP);

/**
 * @route   POST /auth/resend-otp
 * @desc    Resend OTP for registration
 * @access  Public
 */
router.post('/resend-otp', otpLimiter, AuthController.resendOTP);

/**
 * @route   POST /auth/register-sms
 * @desc    Register via SMS (phone-based signup)
 * @access  Public
 */
router.post('/register-sms', otpLimiter, AuthController.registerSMS);

/**
 * @route   POST /auth/verify-sms-otp
 * @desc    Verify SMS OTP and mark lead as verified
 * @access  Public
 */
router.post('/verify-sms-otp', otpLimiter, AuthController.verifySMSOTP);

/**
 * @route   POST /auth/complete-registration
 * @desc    Complete registration by adding email and password
 * @access  Public (requires temp token)
 */
router.post('/complete-registration', AuthController.completeRegistration);

/**
 * @route   POST /auth/register-unified
 * @desc    Unified registration - collect all data upfront, send OTP
 * @access  Public
 */
router.post('/register-unified', otpLimiter, AuthController.registerUnified);

/**
 * @route   POST /auth/verify-otp-unified
 * @desc    Verify OTP for unified registration and create user account
 * @access  Public (requires temp token)
 */
router.post('/verify-otp-unified', otpLimiter, AuthController.verifyUnifiedOTP);

/**
 * @route   POST /auth/resend-sms-otp
 * @desc    Resend SMS OTP for registration
 * @access  Public
 */
router.post('/resend-sms-otp', otpLimiter, AuthController.resendSMSOTP);

/**
 * @route   POST /auth/add-email
 * @desc    Add email to phone-based account
 * @access  Private
 */
router.post('/add-email', authenticate, AuthController.addEmail);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginLimiter, AuthController.login);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
if (csrfProtectionEnabled) {
    router.post('/refresh', csrfProtection, refreshLimiter, AuthController.refresh);
} else {
    router.post('/refresh', refreshLimiter, AuthController.refresh);
}

/**
 * @route   POST /auth/logout
 * @desc    Logout user from current device
 * @access  Private
 */
if (csrfProtectionEnabled) {
    router.post('/logout', csrfProtection, authenticate, AuthController.logout);
} else {
    router.post('/logout', authenticate, AuthController.logout);
}

/**
 * @route   POST /auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private
 */
if (csrfProtectionEnabled) {
    router.post('/logout-all', csrfProtection, authenticate, AuthController.logoutAll);
} else {
    router.post('/logout-all', authenticate, AuthController.logoutAll);
}

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route   POST /auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.post('/change-password', authenticate, AuthController.changePassword);

/**
 * @route   POST /auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', AuthController.verifyEmail);

/**
 * @route   POST /auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification', authenticate, AuthController.resendVerification);

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
