import { ISMSProvider } from './SMSProviderService';
import { logger } from '../config/logger';

/**
 * AWS SNS SMS Provider
 * Implements ISMSProvider interface for AWS SNS integration
 */
export class AWSSNSService implements ISMSProvider {
    private snsClient: any;
    private senderId: string;

    constructor(accessKeyId: string, secretAccessKey: string, region: string, senderId: string) {
        this.senderId = senderId;
        this.initializeSNS(accessKeyId, secretAccessKey, region);
    }

    /**
     * Initialize AWS SNS client (lazy loading to avoid requiring aws-sdk package)
     */
    private async initializeSNS(accessKeyId: string, secretAccessKey: string, region: string): Promise<void> {
        try {
            const awsSdkModule = '@aws-sdk/client-sns';
            const { SNSClient } = await import(awsSdkModule);

            this.snsClient = new SNSClient({
                region: region,
                credentials: {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey,
                },
            });
        } catch (error) {
            logger.error('Failed to initialize AWS SNS client. Install with: npm install @aws-sdk/client-sns', error);
            throw new Error('AWS SNS SDK not available. Please install @aws-sdk/client-sns package.');
        }
    }

    /**
     * Send OTP via AWS SNS
     * @param phone - Phone number in E.164 format (+919876543210)
     * @param otp - 6-digit OTP code
     */
    async sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const { PublishCommand } = await import('@aws-sdk/client-sns');

            const params = {
                Message: `Your OTP for HireAccel is: ${otp}. Valid for 5 minutes. Do not share this code.`,
                PhoneNumber: phone,
                MessageAttributes: {
                    'AWS.SNS.SMS.SenderID': {
                        DataType: 'String',
                        StringValue: this.senderId,
                    },
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: 'Transactional', // High priority, no promotional content
                    },
                },
            };

            const response = await this.snsClient.send(new PublishCommand(params));

            logger.info('AWS SNS SMS sent successfully', {
                messageId: response.MessageId,
                phone: phone,
            });

            return {
                success: true,
                messageId: response.MessageId,
            };
        } catch (error) {
            logger.error('AWS SNS SMS failed', {
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
     * Send custom SMS message via AWS SNS
     */
    async sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const { PublishCommand } = await import('@aws-sdk/client-sns');

            const params = {
                Message: message,
                PhoneNumber: phone,
                MessageAttributes: {
                    'AWS.SNS.SMS.SenderID': {
                        DataType: 'String',
                        StringValue: this.senderId,
                    },
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: 'Transactional',
                    },
                },
            };

            const response = await this.snsClient.send(new PublishCommand(params));

            return {
                success: true,
                messageId: response.MessageId,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send SMS',
            };
        }
    }
}
