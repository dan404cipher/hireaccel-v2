import axios from 'axios';
import { ISMSProvider } from './SMSProviderService';
import { logger } from '../config/logger';

/**
 * Fast2SMS Provider for Indian SMS
 *
 * Features:
 * - ₹0.15 per OTP (most cost-effective for Indian market)
 * - DLT complaint (required for commercial SMS in India)
 * - OTP route with dedicated templates
 * - Voice OTP support
 * - Delivery tracking
 * - Balance checking
 *
 * Setup:
 * 1. Sign up at https://www.fast2sms.com/
 * 2. Get API key from dashboard
 * 3. Register sender ID (6 characters, e.g., HIREAC)
 * 4. Create & approve DLT template
 * 5. Add credentials to .env:
 *    FAST2SMS_API_KEY=your_api_key
 *    FAST2SMS_SENDER_ID=HIREAC
 *    FAST2SMS_ROUTE=otp
 *    FAST2SMS_OTP_TEMPLATE_ID=your_template_id (optional for transactional route)
 *
 * Example DLT Template:
 * "Your OTP for HireAccel registration is {#var#}. Valid for 5 minutes. Do not share."
 */
export class Fast2SMSService implements ISMSProvider {
    private apiKey: string;
    private senderId: string;
    private route: 'otp' | 'transactional' | 'promotional';
    private templateId: string | undefined;
    private client: any; // Using any instead of AxiosInstance
    private baseURL = 'https://www.fast2sms.com/dev/bulkV2';

    constructor(
        apiKey: string,
        senderId: string = 'HIREAC',
        route: 'otp' | 'transactional' | 'promotional' = 'otp',
        templateId?: string,
    ) {
        this.apiKey = apiKey;
        this.senderId = senderId;
        this.route = route;
        this.templateId = templateId || undefined;

        // Initialize axios client with defaults
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                authorization: apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
        });
    }

    /**
     * Send OTP via Fast2SMS
     * @param phone - Indian mobile number (can be with or without +91)
     * @param otp - 6-digit OTP code
     * @returns Object with success status and messageId
     */
    async sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            // Clean phone number - Fast2SMS accepts numbers with or without +91
            const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');

            // Validate Indian mobile number (10 digits starting with 6-9)
            if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                return {
                    success: false,
                    error: 'Invalid Indian mobile number. Must be 10 digits starting with 6-9.',
                };
            }

            // Build request payload based on route
            const payload: any = {
                sender_id: this.senderId,
                language: 'english',
                route: this.route,
                numbers: cleanPhone,
            };

            if (this.route === 'otp') {
                // OTP route - simplest and most reliable for OTP
                payload.variables_values = otp;
                payload.flash = 0; // 0 = normal SMS, 1 = flash SMS (appears directly on screen)
            } else if (this.route === 'transactional' && this.templateId) {
                // Transactional route with DLT template
                payload.message = this.templateId;
                payload.variables_values = otp;
            } else {
                // Fallback to promotional (not recommended for OTP)
                payload.message = `Your OTP for HireAccel is ${otp}. Valid for 5 minutes. Do not share this code.`;
            }

            logger.info('Sending Fast2SMS OTP', {
                phone: cleanPhone,
                route: this.route,
                senderId: this.senderId,
            });

            const response = await this.client.post('', payload);

            if (response.data.return === true) {
                logger.info('Fast2SMS OTP sent successfully', {
                    phone: cleanPhone,
                    messageId: response.data.request_id,
                    status: response.data.message,
                });

                return {
                    success: true,
                    messageId: response.data.request_id,
                };
            } else {
                logger.error('Fast2SMS OTP failed', {
                    phone: cleanPhone,
                    error: response.data.message,
                });

                return {
                    success: false,
                    error: response.data.message || 'Failed to send OTP',
                };
            }
        } catch (error: any) {
            logger.error('Fast2SMS API error', {
                phone: phone,
                error: error instanceof Error ? error.message : 'Unknown error',
                response: error?.response?.data,
            });

            return {
                success: false,
                error: error?.response?.data?.message || error?.message || 'Failed to send OTP',
            };
        }
    }

    /**
     * Send custom SMS message via Fast2SMS
     * @param phone - Indian mobile number
     * @param message - Message to send (max 160 characters for single SMS)
     */
    async sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');

            if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                return {
                    success: false,
                    error: 'Invalid Indian mobile number',
                };
            }

            const payload = {
                sender_id: this.senderId,
                message: message,
                language: 'english',
                route: 'promotional', // Custom messages use promotional route
                numbers: cleanPhone,
            };

            const response = await this.client.post('', payload);

            if (response.data.return === true) {
                return {
                    success: true,
                    messageId: response.data.request_id,
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to send SMS',
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error?.response?.data?.message || error?.message || 'Failed to send SMS',
            };
        }
    }

    /**
     * Send Voice OTP (calls user and speaks the OTP)
     * Useful for users who can't receive SMS
     * @param phone - Indian mobile number
     * @param otp - OTP to speak
     */
    async sendVoiceOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');

            if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                return {
                    success: false,
                    error: 'Invalid Indian mobile number',
                };
            }

            // Voice OTP endpoint
            const voiceClient = axios.create({
                baseURL: 'https://www.fast2sms.com/dev/voice',
                headers: {
                    authorization: this.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });

            const payload = {
                numbers: cleanPhone,
                otp: otp,
            };

            const response = await voiceClient.post('', payload);

            if ((response.data as any).return === true) {
                logger.info('Fast2SMS Voice OTP sent successfully', {
                    phone: cleanPhone,
                    messageId: (response.data as any).request_id,
                });

                return {
                    success: true,
                    messageId: (response.data as any).request_id,
                };
            } else {
                return {
                    success: false,
                    error: (response.data as any).message || 'Failed to send Voice OTP',
                };
            }
        } catch (error: any) {
            logger.error('Fast2SMS Voice OTP error', {
                phone: phone,
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            return {
                success: false,
                error: error?.response?.data?.message || error?.message || 'Failed to send Voice OTP',
            };
        }
    }

    /**
     * Check message delivery status
     * @param messageId - Request ID returned from sendOTP or sendSMS
     */
    async checkStatus(messageId: string): Promise<{ status: string; deliveredAt: Date | undefined }> {
        try {
            const statusClient = axios.create({
                baseURL: 'https://www.fast2sms.com/dev',
                headers: {
                    authorization: this.apiKey,
                },
                timeout: 5000,
            });

            const response = await statusClient.get(`/report/${messageId}`);
            const data = response.data as any;

            if (data.return === true && data.data) {
                const statusData = data.data[0];
                const deliveredAt: Date | undefined = statusData.delivered_at
                    ? new Date(statusData.delivered_at)
                    : undefined;
                return {
                    status: statusData.status || 'unknown',
                    deliveredAt,
                };
            }

            return {
                status: 'unknown',
                deliveredAt: undefined,
            };
        } catch (error) {
            logger.error('Fast2SMS status check error', {
                messageId: messageId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            return {
                status: 'error',
                deliveredAt: undefined,
            };
        }
    }

    /**
     * Get account balance
     * @returns Balance in INR
     */
    async getBalance(): Promise<{ balance: number; currency: string }> {
        try {
            const balanceClient = axios.create({
                baseURL: 'https://www.fast2sms.com/dev',
                headers: {
                    authorization: this.apiKey,
                },
                timeout: 5000,
            });

            const response = await balanceClient.get('/wallet');
            const data = response.data as any;

            if (data.return === true) {
                return {
                    balance: parseFloat(data.wallet) || 0,
                    currency: 'INR',
                };
            }

            return {
                balance: 0,
                currency: 'INR',
            };
        } catch (error) {
            logger.error('Fast2SMS balance check error', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            return {
                balance: 0,
                currency: 'INR',
            };
        }
    }
}
