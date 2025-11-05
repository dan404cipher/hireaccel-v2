import { logger } from '@/config/logger';
import { env } from '@/config/env';

/**
 * SMS Service for sending OTP via SMS
 * Supports multiple SMS providers: Twilio and AWS SNS
 *
 * Setup Instructions:
 * 1. Choose your SMS provider by setting SMS_PROVIDER env variable
 * 2. Install required dependencies:
 *    - For Twilio: npm install twilio
 *    - For AWS SNS: npm install @aws-sdk/client-sns
 * 3. Configure environment variables (see .env.sms.example)
 */
export class SMSService {
    /**
     * Send SMS OTP to phone number
     * @param phoneNumber - Phone number with country code (e.g., +919876543210)
     * @param otp - 6-digit OTP
     * @param firstName - User's first name for personalization
     */
    static async sendOTP(phoneNumber: string, otp: string, firstName: string = 'User'): Promise<void> {
        try {
            logger.info('Sending SMS OTP', {
                phoneNumber: phoneNumber,
                otp: otp, // Remove this in production for security
                firstName: firstName,
            });

            // Skip SMS sending in test mode (TEST_SMS=true)
            if (env.TEST_SMS === true) {
                logger.info(`📱 TEST MODE: Skipping SMS send for ${firstName}`, {
                    phoneNumber: phoneNumber,
                    message: `Hi ${firstName}, your verification code for Hiring Accelerator is: ${otp}. Valid for 10 minutes.`,
                    note: 'TEST_SMS=true - No actual SMS sent',
                });
                return;
            }

            // Mock SMS sending for development
            // Replace this with actual SMS provider integration (Twilio, AWS SNS, etc.)
            if (process.env['NODE_ENV'] === 'development') {
                logger.info(`🚀 SMS OTP for ${firstName}`, {
                    phoneNumber: phoneNumber,
                    message: `Hi ${firstName}, your verification code for Hiring Accelerator is: ${otp}. Valid for 10 minutes.`,
                });
                return;
            }

            // Production SMS implementation
            // Choose your preferred SMS provider
            const smsProvider = env.SMS_PROVIDER || 'twilio';

            if (smsProvider === 'aws-sns') {
                await this.sendSMSViaAWSSNS(phoneNumber, otp, firstName);
            } else {
                await this.sendSMSViaTwilio(phoneNumber, otp, firstName);
            }
        } catch (error) {
            logger.error('Failed to send SMS OTP', {
                phoneNumber: phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Send SMS via Twilio
     *
     * Prerequisites:
     * 1. Install Twilio SDK: npm install twilio
     * 2. Set up Twilio credentials in environment variables
     * 3. Get a Twilio phone number
     */
    private static async sendSMSViaTwilio(phoneNumber: string, otp: string, firstName: string): Promise<void> {
        try {
            // Check if Twilio is available (dynamic import to avoid errors if not installed)
            let twilio: any;
            try {
                const twilioModule = 'twilio';
                twilio = await import(twilioModule);
            } catch (importError) {
                logger.warn('Twilio SDK not installed. Install with: npm install twilio');
                throw new Error('Twilio SDK not available. Please install twilio package.');
            }

            // Validate required environment variables
            if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
                throw new Error('Missing required Twilio environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
            }

            // Initialize Twilio client
            const client = twilio.default(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

            const message = await client.messages.create({
                body: `Hi ${firstName}, your verification code for Hiring Accelerator is: ${otp}. Valid for 10 minutes.`,
                from: env.TWILIO_PHONE_NUMBER,
                to: phoneNumber,
            });

            logger.info('SMS sent successfully via Twilio', {
                messageId: message.sid,
                phoneNumber: phoneNumber,
                status: message.status,
            });
        } catch (error) {
            logger.error('Twilio SMS sending failed', {
                phoneNumber: phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
                provider: 'Twilio',
            });
            throw error;
        }
    }

    /**
     * Send SMS via AWS SNS
     *
     * Prerequisites:
     * 1. Install AWS SDK: npm install @aws-sdk/client-sns
     * 2. Set up AWS credentials and region in environment variables
     * 3. Ensure your AWS account has SNS permissions and is not in sandbox mode
     */
    private static async sendSMSViaAWSSNS(phoneNumber: string, otp: string, firstName: string): Promise<void> {
        try {
            // Check if AWS SNS is available (dynamic import to avoid errors if not installed)
            let SNSClient: any, PublishCommand: any;
            try {
                const awsSdkModule = '@aws-sdk/client-sns';
                const awsSdk: any = await import(awsSdkModule);
                SNSClient = awsSdk.SNSClient;
                PublishCommand = awsSdk.PublishCommand;
            } catch (importError) {
                logger.warn('AWS SDK not installed. Install with: npm install @aws-sdk/client-sns');
                throw new Error('AWS SDK not available. Please install @aws-sdk/client-sns package.');
            }

            // Validate required environment variables
            if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
                throw new Error('Missing required AWS environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
            }

            // Initialize SNS client
            const snsClient = new SNSClient({
                region: env.AWS_REGION,
                credentials: {
                    accessKeyId: env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
                },
            });

            const message = `Hi ${firstName}, your verification code for Hiring Accelerator is: ${otp}. Valid for 10 minutes.`;

            const params = {
                Message: message,
                PhoneNumber: phoneNumber,
                MessageAttributes: {
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: 'Transactional', // Important for OTP messages
                    },
                    ...(env.AWS_SNS_SENDER_ID && {
                        'AWS.SNS.SMS.SenderID': {
                            DataType: 'String',
                            StringValue: env.AWS_SNS_SENDER_ID,
                        },
                    }),
                },
            };

            const command = new PublishCommand(params);
            const result = await snsClient.send(command);

            logger.info('SMS sent successfully via AWS SNS', {
                messageId: result.MessageId,
                phoneNumber: phoneNumber,
                region: env.AWS_REGION,
            });
        } catch (error) {
            logger.error('AWS SNS SMS sending failed', {
                phoneNumber: phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
                provider: 'AWS SNS',
            });
            throw error;
        }
    }

    /**
     * Validate phone number format
     */
    static validatePhoneNumber(phoneNumber: string): boolean {
        // Indian phone number validation with +91 country code
        const indianPhoneRegex = /^\+91[6-9]\d{9}$/;
        return indianPhoneRegex.test(phoneNumber);
    }

    /**
     * Format phone number to include +91 prefix if needed
     */
    static formatPhoneNumber(phoneNumber: string): string {
        const cleaned = phoneNumber.replace(/\D/g, ''); // Remove non-digits

        // If it's a 10-digit Indian number starting with 6-9, add +91
        if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
            return '+91' + cleaned;
        }

        // If it's already 12 digits and starts with 91, add +
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return '+' + cleaned;
        }

        // If it already has +91, return as is
        if (phoneNumber.startsWith('+91')) {
            return phoneNumber;
        }

        // Default: assume it needs +91 prefix
        return '+91' + cleaned;
    }

    /**
     * Check SMS service health and configuration
     * Useful for debugging and monitoring
     */
    static async checkServiceHealth(): Promise<{
        provider: string;
        configured: boolean;
        available: boolean;
        missingConfig?: string[];
        error?: string;
    }> {
        const provider = process.env['SMS_PROVIDER'] || 'twilio';

        try {
            if (provider === 'aws-sns') {
                // Check AWS SNS configuration
                const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
                const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

                if (missingVars.length > 0) {
                    return {
                        provider,
                        configured: false,
                        available: false,
                        missingConfig: missingVars,
                    };
                }

                // Check if AWS SDK is available
                try {
                    const awsSdkModule = '@aws-sdk/client-sns';
                    await import(awsSdkModule);
                    return {
                        provider,
                        configured: true,
                        available: true,
                    };
                } catch {
                    return {
                        provider,
                        configured: true,
                        available: false,
                        error: 'AWS SDK not installed. Run: npm install @aws-sdk/client-sns',
                    };
                }
            } else {
                // Check Twilio configuration
                const requiredEnvVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
                const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

                if (missingVars.length > 0) {
                    return {
                        provider,
                        configured: false,
                        available: false,
                        missingConfig: missingVars,
                    };
                }

                // Check if Twilio SDK is available
                try {
                    const twilioModule = 'twilio';
                    await import(twilioModule);
                    return {
                        provider,
                        configured: true,
                        available: true,
                    };
                } catch {
                    return {
                        provider,
                        configured: true,
                        available: false,
                        error: 'Twilio SDK not installed. Run: npm install twilio',
                    };
                }
            }
        } catch (error) {
            return {
                provider,
                configured: false,
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Send a test SMS (for development/testing purposes)
     * Only works in development mode for security
     */
    static async sendTestSMS(phoneNumber: string): Promise<void> {
        if (process.env['NODE_ENV'] === 'production') {
            throw new Error('Test SMS is not allowed in production environment');
        }

        await this.sendOTP(phoneNumber, '123456', 'Test User');
        logger.info('Test SMS sent successfully', { phoneNumber });
    }
}
