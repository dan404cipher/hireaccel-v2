import { Fast2SMSService } from './Fast2SMSService';
import { TwilioSMSService } from './TwilioSMSService';
import { AWSSNSService } from './AWSSNSService';
import { logger } from '../config/logger';

/**
 * SMS Provider Interface
 * All SMS services must implement this interface
 */
export interface ISMSProvider {
    sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
    sendSMS?(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
    checkStatus?(messageId: string): Promise<{ status: string; deliveredAt: Date | undefined }>;
    getBalance?(): Promise<{ balance: number; currency: string }>;
}

/**
 * SMS Provider Factory
 * Selects and initializes the appropriate SMS provider based on environment configuration
 */
class SMSProviderFactory {
    private static instance: ISMSProvider | null = null;

    /**
     * Get the configured SMS provider instance
     * @returns Singleton instance of the selected SMS provider
     */
    static getProvider(): ISMSProvider {
        if (this.instance) {
            return this.instance;
        }

        const provider = process.env['SMS_PROVIDER']?.toLowerCase() || 'fast2sms';
        const testMode = process.env['TEST_SMS'] === 'true';

        if (testMode) {
            logger.info(`SMS Test Mode Enabled - Using ${provider} provider (no actual SMS sent)`);
        }

        switch (provider) {
            case 'fast2sms':
                if (!process.env['FAST2SMS_API_KEY']) {
                    throw new Error('FAST2SMS_API_KEY is required when SMS_PROVIDER is set to fast2sms');
                }
                this.instance = new Fast2SMSService(
                    process.env['FAST2SMS_API_KEY'],
                    process.env['FAST2SMS_SENDER_ID'] || 'HIREAC',
                    (process.env['FAST2SMS_ROUTE'] as 'otp' | 'transactional' | 'promotional') || 'otp',
                    process.env['FAST2SMS_OTP_TEMPLATE_ID'],
                );
                logger.info('SMS Provider: Fast2SMS initialized');
                break;

            case 'twilio':
                if (
                    !process.env['TWILIO_ACCOUNT_SID'] ||
                    !process.env['TWILIO_AUTH_TOKEN'] ||
                    !process.env['TWILIO_PHONE_NUMBER']
                ) {
                    throw new Error(
                        'Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are required',
                    );
                }
                this.instance = new TwilioSMSService(
                    process.env['TWILIO_ACCOUNT_SID'],
                    process.env['TWILIO_AUTH_TOKEN'],
                    process.env['TWILIO_PHONE_NUMBER'],
                );
                logger.info('SMS Provider: Twilio initialized');
                break;

            case 'aws-sns':
            case 'sns':
                if (
                    !process.env['AWS_ACCESS_KEY_ID'] ||
                    !process.env['AWS_SECRET_ACCESS_KEY'] ||
                    !process.env['AWS_REGION']
                ) {
                    throw new Error(
                        'AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) are required',
                    );
                }
                this.instance = new AWSSNSService(
                    process.env['AWS_ACCESS_KEY_ID'],
                    process.env['AWS_SECRET_ACCESS_KEY'],
                    process.env['AWS_REGION'],
                    process.env['AWS_SNS_SENDER_ID'] || 'HireAccel',
                );
                logger.info('SMS Provider: AWS SNS initialized');
                break;

            default:
                throw new Error(`Unsupported SMS provider: ${provider}. Use 'fast2sms', 'twilio', or 'aws-sns'`);
        }

        if (!this.instance) {
            throw new Error('Failed to initialize SMS provider');
        }

        return this.instance;
    }

    /**
     * Reset the provider instance (useful for testing or switching providers)
     */
    static resetProvider(): void {
        this.instance = null;
    }

    /**
     * Check if SMS test mode is enabled
     */
    static isTestMode(): boolean {
        return process.env['TEST_SMS'] === 'true';
    }

    /**
     * Get the current provider name
     */
    static getProviderName(): string {
        return process.env['SMS_PROVIDER']?.toLowerCase() || 'fast2sms';
    }
}

/**
 * Send OTP via the configured SMS provider
 * @param phone - Recipient phone number in E.164 format (+919876543210)
 * @param otp - 6-digit OTP code
 * @returns Object with success status and optional messageId or error
 */
export async function sendOTPSMS(
    phone: string,
    otp: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const provider = SMSProviderFactory.getProvider();

        // In test mode, simulate success without sending actual SMS
        if (SMSProviderFactory.isTestMode()) {
            logger.info(`[TEST MODE] Would send OTP ${otp} to ${phone} via ${SMSProviderFactory.getProviderName()}`);
            return {
                success: true,
                messageId: `test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            };
        }

        const result = await provider.sendOTP(phone, otp);

        if (result.success) {
            logger.info(`OTP sent successfully to ${phone} via ${SMSProviderFactory.getProviderName()}`, {
                messageId: result.messageId,
                provider: SMSProviderFactory.getProviderName(),
            });
        } else {
            logger.error(`Failed to send OTP to ${phone} via ${SMSProviderFactory.getProviderName()}`, {
                error: result.error,
                provider: SMSProviderFactory.getProviderName(),
            });
        }

        return result;
    } catch (error) {
        logger.error('Error in sendOTPSMS:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error sending SMS',
        };
    }
}

/**
 * Send a custom SMS message via the configured provider (if supported)
 * @param phone - Recipient phone number in E.164 format
 * @param message - Message to send
 */
export async function sendCustomSMS(
    phone: string,
    message: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const provider = SMSProviderFactory.getProvider();

        if (!provider.sendSMS) {
            return {
                success: false,
                error: `Custom SMS not supported by ${SMSProviderFactory.getProviderName()} provider`,
            };
        }

        if (SMSProviderFactory.isTestMode()) {
            logger.info(`[TEST MODE] Would send message to ${phone}: ${message}`);
            return {
                success: true,
                messageId: `test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            };
        }

        return await provider.sendSMS(phone, message);
    } catch (error) {
        logger.error('Error in sendCustomSMS:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error sending SMS',
        };
    }
}

/**
 * Check SMS delivery status (if supported by provider)
 * @param messageId - Message ID from sendOTP or sendSMS
 */
export async function checkSMSStatus(
    messageId: string,
): Promise<{ status: string; deliveredAt: Date | undefined } | null> {
    try {
        const provider = SMSProviderFactory.getProvider();

        if (!provider.checkStatus) {
            logger.warn(`Status checking not supported by ${SMSProviderFactory.getProviderName()} provider`);
            return null;
        }

        return await provider.checkStatus(messageId);
    } catch (error) {
        logger.error('Error checking SMS status:', error);
        return null;
    }
}

/**
 * Get SMS provider account balance (if supported)
 */
export async function getSMSBalance(): Promise<{ balance: number; currency: string } | null> {
    try {
        const provider = SMSProviderFactory.getProvider();

        if (!provider.getBalance) {
            logger.warn(`Balance checking not supported by ${SMSProviderFactory.getProviderName()} provider`);
            return null;
        }

        return await provider.getBalance();
    } catch (error) {
        logger.error('Error getting SMS balance:', error);
        return null;
    }
}

export default SMSProviderFactory;
