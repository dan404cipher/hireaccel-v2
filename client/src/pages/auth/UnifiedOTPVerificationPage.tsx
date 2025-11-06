import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const UnifiedOTPVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const { updateAuth } = useAuth();

    // Get verification data from sessionStorage
    const getVerificationData = () => {
        const storedData = sessionStorage.getItem('unified_verification_data');
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                // Validate timestamp (data should be less than 15 minutes old)
                if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
                    return parsed;
                }
            } catch (e) {
                console.error('Failed to parse verification data:', e);
            }
        }
        return null;
    };

    const verificationData = getVerificationData();

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

    // Redirect if no verification data
    useEffect(() => {
        if (!verificationData) {
            sessionStorage.removeItem('unified_verification_data');
            navigate('/register/candidate', { replace: true });
        }
    }, [verificationData, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const isStillOnVerificationPage = window.location.pathname.includes('/auth/verify-unified');
            if (!isStillOnVerificationPage) {
                sessionStorage.removeItem('unified_verification_data');
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) {
            setError('Please enter the OTP');
            return;
        }

        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }

        if (!verificationData) {
            setError('Verification session expired. Please start again.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await apiClient.verifyUnifiedOTP(
                {
                    leadId: verificationData.leadId,
                    otp: otp.trim(),
                },
                verificationData.tempToken,
            );

            if (response.success && response.data) {
                const user = response.data.user;
                const accessToken = response.data.accessToken;

                // Store auth data
                apiClient.setToken(accessToken);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user', JSON.stringify(user));

                // Clear verification data
                sessionStorage.removeItem('unified_verification_data');

                // Update auth context
                updateAuth(user);

                setSuccess('Account verified successfully! Redirecting...');

                // Navigate to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (error: unknown) {
            console.error('OTP verification failed:', error);
            if (error && typeof error === 'object' && 'message' in error) {
                setError((error as { message: string }).message);
            } else if (error && typeof error === 'object' && 'detail' in error) {
                setError((error as { detail: string }).detail);
            } else {
                setError('Invalid or expired OTP. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!verificationData) {
            setError('Verification session expired. Please start again.');
            return;
        }

        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            // Call the same registration endpoint again to resend OTP
            // This will use the existing lead and just resend the OTP
            const resendData = {
                fullName: verificationData.fullName,
                phoneNumber: verificationData.phoneNumber,
                email: verificationData.email,
                password: verificationData.password, // Password was stored in sessionStorage
                role: verificationData.role,
                source: verificationData.source,
                designation: verificationData.designation,
                utmData: verificationData.utmData,
            };

            const response = await apiClient.registerUnified(resendData);

            if (response.success) {
                // Update tempToken in case it changed
                const updatedData = {
                    ...verificationData,
                    tempToken: response.data.tempToken,
                    timestamp: Date.now(),
                };
                sessionStorage.setItem('unified_verification_data', JSON.stringify(updatedData));

                setSuccess('New OTP sent successfully!');
                setTimeRemaining(600); // Reset timer
                setOtp(''); // Clear OTP input
            }
        } catch (error: unknown) {
            console.error('Resend OTP failed:', error);
            if (error && typeof error === 'object' && 'message' in error) {
                setError((error as { message: string }).message);
            } else if (error && typeof error === 'object' && 'detail' in error) {
                setError((error as { detail: string }).detail);
            } else {
                setError('Failed to resend OTP. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleBackToSignup = () => {
        sessionStorage.removeItem('unified_verification_data');
        const signupPath = verificationData?.role === 'candidate' ? '/register/candidate' : '/register/hr';
        navigate(signupPath, { replace: true });
    };

    const handleOTPInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
            setError(''); // Clear error when user starts typing
        }
    };

    if (!verificationData) {
        return null; // Will redirect via useEffect
    }

    const VerificationIcon = verificationData.verificationType === 'sms' ? Smartphone : Mail;
    const verificationLabel = verificationData.verificationType === 'sms' ? 'Mobile Number' : 'Email';

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <Card className='shadow-lg border-0'>
                    <CardHeader className='text-center pb-4'>
                        <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <VerificationIcon className='h-8 w-8 text-white' />
                        </div>
                        <CardTitle className='text-2xl font-bold text-gray-900'>
                            Verify Your {verificationLabel}
                        </CardTitle>
                        <CardDescription className='text-gray-600'>
                            We've sent a 6-digit verification code to
                            <div className='font-semibold text-gray-900 mt-1'>{verificationData.maskedContact}</div>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className='space-y-6'>
                        {error && (
                            <Alert variant='destructive'>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className='border-green-200 bg-green-50'>
                                <AlertDescription className='text-green-800'>{success}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleVerifyOTP} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='otp' className='text-sm font-medium text-gray-700'>
                                    Verification Code
                                </Label>
                                <Input
                                    id='otp'
                                    type='text'
                                    value={otp}
                                    onChange={handleOTPInputChange}
                                    placeholder='Enter 6-digit code'
                                    className='text-center text-lg tracking-widest font-mono'
                                    maxLength={6}
                                    autoComplete='one-time-code'
                                    autoFocus
                                    disabled={isLoading || !!success}
                                />
                                <div className='text-xs text-gray-500 text-center'>
                                    Code expires in:{' '}
                                    <span className='font-mono font-semibold'>{formatTime(timeRemaining)}</span>
                                </div>
                            </div>

                            <Button
                                type='submit'
                                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                disabled={isLoading || otp.length !== 6 || !!success}
                                data-gtm-cta='unified_verify_otp_button'
                                data-gtm-cta-text='Verify & Create Account'
                                data-gtm-cta-position='otp_verification'
                                data-gtm-page='unified_otp_verification'
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Create Account'
                                )}
                            </Button>
                        </form>

                        <div className='space-y-3'>
                            <div className='text-sm text-center text-gray-600'>Didn't receive the code?</div>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-full'
                                onClick={handleResendOTP}
                                disabled={isResending || isLoading || timeRemaining > 540 || !!success}
                                data-gtm-cta='unified_resend_otp_button'
                                data-gtm-cta-text='Resend Code'
                                data-gtm-cta-position='otp_verification'
                                data-gtm-page='unified_otp_verification'
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className='mr-2 h-4 w-4' />
                                        Resend Code
                                    </>
                                )}
                            </Button>

                            <Button
                                type='button'
                                variant='ghost'
                                className='w-full'
                                onClick={handleBackToSignup}
                                disabled={isLoading || !!success}
                                data-gtm-nav='unified_back_to_signup_button'
                                data-gtm-nav-text='Back to Sign Up'
                                data-gtm-nav-destination={`/register/${verificationData.role}`}
                            >
                                <ArrowLeft className='mr-2 h-4 w-4' />
                                Back to Sign Up
                            </Button>
                        </div>

                        <div className='text-xs text-center text-gray-500'>
                            By verifying, you agree to our Terms of Service and Privacy Policy
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UnifiedOTPVerificationPage;
