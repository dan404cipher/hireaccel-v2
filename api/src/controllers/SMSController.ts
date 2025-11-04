import { Request, Response } from 'express';
import { SMSService } from '@/services/SMSService';
import { asyncHandler } from '@/middleware/errorHandler';

/**
 * SMS Health Check Controller
 * Provides endpoints for checking SMS service status and sending test SMS
 */
export class SMSController {
    /**
     * Check SMS service health
     * GET /sms/health
     */
    static checkHealth = asyncHandler(async (_req: Request, res: Response) => {
        const healthStatus = await SMSService.checkServiceHealth();

        const statusCode = healthStatus.configured && healthStatus.available ? 200 : 503;

        res.status(statusCode).json({
            success: healthStatus.configured && healthStatus.available,
            service: 'SMS',
            ...healthStatus,
            timestamp: new Date().toISOString(),
        });
    });

    /**
     * Send test SMS (Development only)
     * POST /sms/test
     */
    static sendTestSMS = asyncHandler(async (req: Request, res: Response) => {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required',
            });
        }

        // Validate phone number format
        if (!SMSService.validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Expected: +91xxxxxxxxxx',
            });
        }

        await SMSService.sendTestSMS(phoneNumber);

        res.status(200).json({
            success: true,
            message: 'Test SMS sent successfully',
            phoneNumber: phoneNumber,
            note: 'Check your SMS inbox for the test message',
        });
    });
}
