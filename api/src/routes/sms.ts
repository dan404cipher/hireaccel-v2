import { Router } from 'express';
import { SMSController } from '@/controllers/SMSController';

/**
 * SMS routes
 * Health check and testing endpoints for SMS service
 */
const router = Router();

/**
 * @route   GET /sms/health
 * @desc    Check SMS service health and configuration
 * @access  Public (for monitoring)
 */
router.get('/health', SMSController.checkHealth);

/**
 * @route   POST /sms/test
 * @desc    Send test SMS (Development only)
 * @access  Public (Development only)
 */
router.post('/test', SMSController.sendTestSMS);

export default router;
