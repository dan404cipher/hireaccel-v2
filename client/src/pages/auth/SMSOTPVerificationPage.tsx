import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, RefreshCw, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useAuth, type User } from '@/contexts/AuthContext';

interface SMSOTPVerificationPageProps {
    onVerificationSuccess?: () => void;
}

export const SMSOTPVerificationPage: React.FC<SMSOTPVerificationPageProps> = ({ onVerificationSuccess }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { updateAuth } = useAuth();

    // Get data from sessionStorage (secure) or fallback to location state
    const getVerificationData = () => {
        // Try to get from sessionStorage first (most secure)
        const storedData = sessionStorage.getItem('sms_verification_data');
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                // Validate timestamp (data should be less than 15 minutes old)
                if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
                    return {
                        phoneNumber: parsed.phoneNumber || '',
                        userType: parsed.userType || 'candidate',
                        firstName: parsed.firstName || 'User',
                    };
                }
            } catch (e) {
                console.error('Failed to parse verification data:', e);
            }
        }

        // Fallback to location state if available
        if (location.state?.phoneNumber) {
            return {
                phoneNumber: location.state.phoneNumber || '',
                userType: location.state.userType || 'candidate',
                firstName: location.state.firstName || 'User',
            };
        }

        // Last resort: URL parameters (deprecated, kept for backwards compatibility)
        return {
            phoneNumber: searchParams.get('phone') || '',
            userType: searchParams.get('role') || 'candidate',
            firstName: searchParams.get('name') || 'User',
        };
    };

    const initialData = getVerificationData();
    const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber);
    const [userType, setUserType] = useState(initialData.userType);
    const [firstName, setFirstName] = useState(initialData.firstName);

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
    const [needsEmailSetup, setNeedsEmailSetup] = useState(false);
    const [isVerified, setIsVerified] = useState(false); // Track if verification was successful

    // Redirect if no phone number provided (but not if we've already verified)
    useEffect(() => {
        if (!phoneNumber && !isVerified) {
            // Clear any stale verification data
            sessionStorage.removeItem('sms_verification_data');
            const defaultUserType = userType || 'candidate';
            navigate(defaultUserType === 'hr' ? '/register/hr' : '/register/candidate', { replace: true });
        }
    }, [phoneNumber, userType, navigate, isVerified]);

    // Cleanup verification data when component unmounts (user navigates away)
    useEffect(() => {
        return () => {
            // Only clear if OTP wasn't successfully verified
            // (successful verification already clears it)
            const isStillOnVerificationPage = window.location.pathname.includes('/auth/verify-sms');
            if (!isStillOnVerificationPage) {
                sessionStorage.removeItem('sms_verification_data');
            }
        };
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatPhoneNumber = (phone: string) => {
        if (phone.startsWith('+91')) {
            return phone.replace('+91', '+91 ') + ' (Hidden for privacy)';
        }
        return phone;
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

        setIsLoading(true);
        setError('');

        try {
            const response = await apiClient.verifySMSOTP({
                phoneNumber,
                otp: otp.trim(),
            });

            if (response.success && response.data) {
                // Access data directly from response.data (not response.data.data)
                const { leadId, tempToken, phoneNumber: verifiedPhone, role, nextStep } = response.data;

                // Mark as verified before clearing sessionStorage to prevent redirect
                setIsVerified(true);

                // Store temporary data for completing registration
                sessionStorage.setItem(
                    'lead_verification_data',
                    JSON.stringify({
                        leadId,
                        tempToken,
                        phoneNumber: verifiedPhone,
                        role,
                        nextStep,
                        timestamp: Date.now(),
                    }),
                );

                // Clear old verification data
                sessionStorage.removeItem('sms_verification_data');

                setSuccess('Phone verified! Redirecting to complete registration...');

                // Navigate to email setup page immediately (no delay needed)
                navigate('/auth/complete-registration', { replace: true });
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (error: unknown) {
            console.error('SMS OTP verification failed:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else if (typeof error === 'object' && error !== null && 'detail' in error) {
                setError((error as { detail: string }).detail);
            } else {
                setError('Invalid or expired OTP. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            const response = await apiClient.resendSMSOTP({ phoneNumber });

            if (response.success) {
                setSuccess('New OTP sent to your mobile number!');
                setTimeRemaining(600); // Reset timer to 10 minutes
                setOtp(''); // Clear current OTP input
            }
        } catch (error: unknown) {
            console.error('Resend SMS OTP failed:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else if (typeof error === 'object' && error !== null && 'detail' in error) {
                setError((error as { detail: string }).detail);
            } else {
                setError('Failed to resend OTP. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleBackToSignup = () => {
        // Clear verification data when going back
        sessionStorage.removeItem('sms_verification_data');

        // Navigate back to appropriate signup page
        const signupPath = userType === 'hr' ? '/register/hr' : '/register/candidate';
        navigate(signupPath, { replace: true });
    };

    const handleOTPInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
            setError(''); // Clear error when user starts typing
        }
    };

    const handleEmailSetup = () => {
        navigate('/auth/setup-email', {
            state: { fromSMSVerification: true },
            replace: true,
        });
    };

    if (!phoneNumber) {
        return null; // Will redirect via useEffect
    }

    if (needsEmailSetup) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
                <div className='w-full max-w-md'>
                    <Card className='shadow-lg border-0'>
                        <CardHeader className='text-center pb-4'>
                            <div className='w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <Smartphone className='h-8 w-8 text-white' />
                            </div>
                            <CardTitle className='text-2xl font-bold text-gray-900'>Phone Verified! 🎉</CardTitle>
                            <CardDescription className='text-gray-600'>
                                Complete your profile by setting up email and password
                            </CardDescription>
                        </CardHeader>

                        <CardContent className='space-y-6'>
                            <Alert className='border-green-200 bg-green-50'>
                                <AlertDescription className='text-green-800'>
                                    Welcome {firstName}! Your phone number has been verified successfully.
                                </AlertDescription>
                            </Alert>

                            <div className='space-y-4'>
                                <p className='text-center text-gray-600'>
                                    To complete your account setup and access all features, please add your email and
                                    create a password.
                                </p>

                                <Button
                                    onClick={handleEmailSetup}
                                    className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                >
                                    Setup Email & Password
                                </Button>

                                <Button
                                    variant='ghost'
                                    onClick={() => navigate('/dashboard')}
                                    className='w-full text-gray-600 hover:text-gray-700'
                                >
                                    Skip for now (Dashboard)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <Card className='shadow-lg border-0'>
                    <CardHeader className='text-center pb-4'>
                        <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <Smartphone className='h-8 w-8 text-white' />
                        </div>
                        <CardTitle className='text-2xl font-bold text-gray-900'>Verify Your Mobile</CardTitle>
                        <CardDescription className='text-gray-600'>
                            We've sent a 6-digit verification code to
                            <div className='font-semibold text-gray-900 mt-1'>{formatPhoneNumber(phoneNumber)}</div>
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
                                />
                                <div className='text-xs text-gray-500 text-center'>
                                    Code expires in:{' '}
                                    <span className='font-mono font-semibold'>{formatTime(timeRemaining)}</span>
                                </div>
                            </div>

                            <Button
                                type='submit'
                                disabled={isLoading || otp.length !== 6}
                                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Mobile'
                                )}
                            </Button>
                        </form>

                        <div className='space-y-3'>
                            <div className='text-center'>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    onClick={handleResendOTP}
                                    disabled={isResending || timeRemaining > 540} // Allow resend after 1 minute
                                    className='text-sm text-blue-600 hover:text-blue-700'
                                >
                                    {isResending ? (
                                        <>
                                            <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className='mr-2 h-4 w-4' />
                                            Resend Code
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className='text-center'>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    onClick={handleBackToSignup}
                                    className='text-sm text-gray-600 hover:text-gray-700'
                                >
                                    <ArrowLeft className='mr-2 h-4 w-4' />
                                    Back to Sign Up
                                </Button>
                            </div>
                        </div>

                        <div className='text-xs text-gray-500 text-center space-y-1'>
                            <p>Didn't receive the SMS? Check your message inbox.</p>
                            <p>Still having trouble? Contact support.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className='text-center mt-6'>
                    <p className='text-sm text-gray-600'>
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className='text-blue-600 hover:text-blue-700 font-medium'
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
