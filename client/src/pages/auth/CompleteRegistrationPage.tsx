import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/services/api';

export default function CompleteRegistrationPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { updateAuth } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [verificationData, setVerificationData] = useState<{
        leadId: string;
        tempToken: string;
        phoneNumber: string;
        role: string;
    } | null>(null);

    useEffect(() => {
        // Get verification data from sessionStorage
        const storedData = sessionStorage.getItem('lead_verification_data');

        if (!storedData) {
            toast({
                title: 'Session Expired',
                description: 'Please start the registration process again.',
                variant: 'destructive',
            });
            navigate('/register/candidate');
            return;
        }

        try {
            const data = JSON.parse(storedData);
            const timestamp = data.timestamp || 0;
            const now = Date.now();

            // Check if data is less than 30 minutes old
            if (now - timestamp > 30 * 60 * 1000) {
                toast({
                    title: 'Session Expired',
                    description: 'Your verification has expired. Please start again.',
                    variant: 'destructive',
                });
                sessionStorage.removeItem('lead_verification_data');
                navigate('/register/candidate');
                return;
            }

            setVerificationData(data);
        } catch (error) {
            console.error('Failed to parse verification data:', error);
            navigate('/register/candidate');
        }
    }, [navigate, toast]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('one number');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);

        if (value) {
            const validation = validatePassword(value);
            if (!validation.isValid) {
                setPasswordError(`Password must contain ${validation.errors.join(', ')}`);
            } else {
                setPasswordError('');
            }
        } else {
            setPasswordError('');
        }

        // Check confirm password match
        if (confirmPassword && value !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (value && value !== password) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate email
        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setEmailError('');

        // Validate password
        if (!password) {
            setPasswordError('Password is required');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setPasswordError(`Password must contain ${passwordValidation.errors.join(', ')}`);
            return;
        }

        setPasswordError('');

        // Validate confirm password
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }

        setConfirmPasswordError('');

        if (!verificationData) {
            toast({
                title: 'Error',
                description: 'Verification data not found. Please start again.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.completeRegistration(
                {
                    email: email.trim(),
                    password: password,
                },
                verificationData.tempToken,
            );

            if (response.success) {
                const responseData = response.data as {
                    user: User;
                    accessToken: string;
                };
                const { user, accessToken } = responseData;

                // Store auth data
                apiClient.setToken(accessToken);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user', JSON.stringify(user));

                // Clear verification data
                sessionStorage.removeItem('lead_verification_data');

                // Update auth context
                updateAuth(user);

                toast({
                    title: 'Success!',
                    description: 'Your account has been created successfully.',
                });

                // Navigate to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
        } catch (error: unknown) {
            console.error('Registration completion failed:', error);

            if (error && typeof error === 'object' && 'detail' in error) {
                const errorDetail = (error as { detail: string }).detail;

                if (errorDetail.includes('email')) {
                    setEmailError(errorDetail);
                } else {
                    toast({
                        title: 'Registration Failed',
                        description: errorDetail,
                        variant: 'destructive',
                    });
                }
            } else if (error instanceof Error) {
                toast({
                    title: 'Registration Failed',
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Registration Failed',
                    description: 'Something went wrong. Please try again.',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!verificationData) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
                <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
            <div className='w-full max-w-md'>
                {/* Success Indicator */}
                <div className='text-center mb-6'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
                        <CheckCircle className='h-8 w-8 text-green-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>Phone Verified!</h1>
                    <p className='text-gray-600'>Complete your registration by setting up your email and password.</p>
                    <p className='text-sm text-gray-500 mt-2'>
                        Phone: <span className='font-medium'>{verificationData.phoneNumber}</span>
                    </p>
                </div>

                {/* Registration Form */}
                <div className='bg-white rounded-lg shadow-xl p-8'>
                    <form
                        onSubmit={handleSubmit}
                        className='space-y-6'
                        data-gtm-form={`${verificationData?.role === 'hr' ? 'hr' : 'candidate'}_email_setup`}
                        data-gtm-cta-funnel={`${verificationData?.role === 'hr' ? 'hr' : 'candidate'}_signup`}
                        data-gtm-cta-step='3'
                    >
                        {/* Email Input */}
                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                                Email Address
                            </label>
                            <div className='relative'>
                                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                                <Input
                                    id='email'
                                    type='email'
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder='your.email@example.com'
                                    className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                    autoComplete='email'
                                    autoFocus
                                    data-gtm-element={`${
                                        verificationData?.role === 'hr' ? 'hr' : 'candidate'
                                    }_email_input`}
                                />
                            </div>
                            {emailError && <p className='mt-1 text-sm text-red-600'>{emailError}</p>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                                Password
                            </label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                                <Input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder='Create a strong password'
                                    className={`pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                    autoComplete='new-password'
                                    data-gtm-element={`${
                                        verificationData?.role === 'hr' ? 'hr' : 'candidate'
                                    }_password_input`}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                                </button>
                            </div>
                            {passwordError && <p className='mt-1 text-sm text-red-600'>{passwordError}</p>}
                            {!passwordError && password && (
                                <p className='mt-1 text-xs text-gray-500'>
                                    Password strength:{' '}
                                    {password.length < 8 ? 'Weak' : password.length < 12 ? 'Medium' : 'Strong'}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-2'>
                                Confirm Password
                            </label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                                <Input
                                    id='confirmPassword'
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    placeholder='Confirm your password'
                                    className={`pl-10 pr-10 ${confirmPasswordError ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                    autoComplete='new-password'
                                    data-gtm-element={`${
                                        verificationData?.role === 'hr' ? 'hr' : 'candidate'
                                    }_confirm_password_input`}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                                </button>
                            </div>
                            {confirmPasswordError && (
                                <p className='mt-1 text-sm text-red-600'>{confirmPasswordError}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type='submit'
                            className='w-full'
                            size='lg'
                            disabled={isLoading}
                            data-gtm-cta={`${
                                verificationData?.role === 'hr' ? 'hr' : 'candidate'
                            }_create_account_button`}
                            data-gtm-cta-text='Create Account'
                            data-gtm-cta-position='email_setup_page'
                            data-gtm-cta-funnel={`${verificationData?.role === 'hr' ? 'hr' : 'candidate'}_signup`}
                            data-gtm-cta-step='3'
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    {/* Help Text */}
                    <div className='mt-6 text-center text-sm text-gray-600'>
                        <p>
                            By creating an account, you agree to our{' '}
                            <a href='/terms' className='text-blue-600 hover:underline'>
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href='/privacy' className='text-blue-600 hover:underline'>
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
