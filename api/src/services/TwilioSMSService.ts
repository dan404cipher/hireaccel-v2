import { ISMSProvider } from './SMSProviderService';
import { logger } from '../config/logger';

/**
 * Twilio SMS Provider
 * Implements ISMSProvider interface for Twilio integration
 */
export class TwilioSMSService implements ISMSProvider {
    private twilioClient: any;
    private fromNumber: string;

    constructor(accountSid: string, authToken: string, fromNumber: string) {
        this.fromNumber = fromNumber;
        this.initializeTwilio(accountSid, authToken);
    }

    /**
     * Initialize Twilio client (lazy loading to avoid requiring twilio package)
     */
    private async initializeTwilio(accountSid: string, authToken: string): Promise<void> {
        try {
            const twilioModule = 'twilio';
            const twilio = await import(twilioModule);
            this.twilioClient = twilio.default(accountSid, authToken);
        } catch (error) {
            logger.error('Failed to initialize Twilio client. Install with: npm install twilio', error);
            throw new Error('Twilio SDK not available. Please install twilio package.');
        }
    }

    /**
     * Send OTP via Twilio SMS
     * @param phone - Phone number in E.164 format (+919876543210)
     * @param otp - 6-digit OTP code
     */
    async sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const message = await this.twilioClient.messages.create({
                body: `Your OTP for HireAccel is: ${otp}. Valid for 5 minutes. Do not share this code.`,
                from: this.fromNumber,
                to: phone,
            });

            logger.info('Twilio SMS sent successfully', {
                messageId: message.sid,
                phone: phone,
                status: message.status,
            });

            return {
                success: true,
                messageId: message.sid,
            };
        } catch (error) {
            logger.error('Twilio SMS failed', {
                phone: phone,
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send SMS',
            };
        }
    }

    /**
     * Send custom SMS message via Twilio
     */
    async sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const twilioMessage = await this.twilioClient.messages.create({
                body: message,
                from: this.fromNumber,
                to: phone,
            });

            return {
                success: true,
                messageId: twilioMessage.sid,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send SMS',
            };
        }
    }

    /**
     * Check message delivery status
     */
    async checkStatus(messageId: string): Promise<{ status: string; deliveredAt: Date | undefined }> {
        try {
            const message = await this.twilioClient.messages(messageId).fetch();

            return {
                status: message.status,
                deliveredAt: message.dateUpdated || undefined,
            };
        } catch (error) {
            logger.error('Failed to check Twilio message status', { messageId, error });
            throw error;
        }
    }
}
