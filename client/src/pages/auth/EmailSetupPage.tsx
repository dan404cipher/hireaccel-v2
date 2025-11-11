import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mail, Eye, EyeOff, Check, X } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useAuth, type User } from '@/contexts/AuthContext';

interface EmailSetupPageProps {
    onSetupComplete?: () => void;
}

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export function EmailSetupPage({ onSetupComplete }: EmailSetupPageProps): React.JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateAuth } = useAuth();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Redirect if not from SMS verification or already has email
    React.useEffect(() => {
        if (!location.state?.fromSMSVerification && user?.email) {
            navigate('/dashboard', { replace: true });
        }
    }, [location.state, user, navigate]);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    // Password strength validation
    const passwordCriteria = {
        length: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
        hasSpecialChar: /[^a-zA-Z0-9]/.test(formData.password),
        hasNoSpaces: !/\s/.test(formData.password),
    };

    const passwordScore = Object.values(passwordCriteria).filter(Boolean).length;
    const passwordStrength = passwordScore <= 2 ? 'weak' : passwordScore <= 4 ? 'medium' : 'strong';

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!formData.password) {
            setError('Password is required');
            return false;
        }

        if (passwordScore < 4) {
            setError('Password must meet at least 4 of the security criteria');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await apiClient.addEmail({
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });

            if (response.success) {
                const responseData = response.data as { user: User };
                const updatedUser = responseData.user;

                // Update auth context with new user data
                if (updatedUser) {
                    updateAuth(updatedUser);
                }

                setSuccess('Email and password set up successfully! Redirecting to dashboard...');

                if (onSetupComplete) {
                    onSetupComplete();
                } else {
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                }
            } else {
                setError('Setup failed. Please try again.');
            }
        } catch (error: unknown) {
            console.error('Email setup failed:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else if (typeof error === 'object' && error !== null && 'detail' in error) {
                setError((error as { detail: string }).detail);
            } else {
                setError('Failed to set up email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
        <div className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
            {met ? <Check className='h-3 w-3 mr-1' /> : <X className='h-3 w-3 mr-1' />}
            {text}
        </div>
    );

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <Card className='border-0 shadow-lg'>
                    <CardHeader className='text-center pb-4'>
                        <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <Mail className='h-8 w-8 text-white' />
                        </div>
                        <CardTitle className='text-2xl font-bold text-gray-900'>Complete Your Profile</CardTitle>
                        <CardDescription className='text-gray-600'>
                            Add email and password to access all features
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

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='email'>Email Address</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder='Enter your email address'
                                    disabled={loading}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='password'>Create Password</Label>
                                <div className='relative'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder='Create a strong password'
                                        disabled={loading}
                                        className='pr-10'
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                    </Button>
                                </div>

                                {formData.password && (
                                    <div className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-xs text-gray-600'>Password Strength</span>
                                            <span
                                                className={`text-xs font-medium ${
                                                    passwordStrength === 'weak'
                                                        ? 'text-red-600'
                                                        : passwordStrength === 'medium'
                                                        ? 'text-yellow-600'
                                                        : 'text-green-600'
                                                }`}
                                            >
                                                {passwordStrength.toUpperCase()}
                                            </span>
                                        </div>
                                        <Progress
                                            value={(passwordScore / 6) * 100}
                                            className={`h-2 ${
                                                passwordStrength === 'weak'
                                                    ? '[&>div]:bg-red-500'
                                                    : passwordStrength === 'medium'
                                                    ? '[&>div]:bg-yellow-500'
                                                    : '[&>div]:bg-green-500'
                                            }`}
                                        />
                                        <div className='grid grid-cols-2 gap-1 mt-2'>
                                            <CriteriaItem met={passwordCriteria.length} text='8+ characters' />
                                            <CriteriaItem met={passwordCriteria.hasUppercase} text='Uppercase letter' />
                                            <CriteriaItem met={passwordCriteria.hasLowercase} text='Lowercase letter' />
                                            <CriteriaItem met={passwordCriteria.hasNumber} text='Number' />
                                            <CriteriaItem
                                                met={passwordCriteria.hasSpecialChar}
                                                text='Special character'
                                            />
                                            <CriteriaItem met={passwordCriteria.hasNoSpaces} text='No spaces' />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                                <div className='relative'>
                                    <Input
                                        id='confirmPassword'
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        placeholder='Confirm your password'
                                        disabled={loading}
                                        className='pr-10'
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className='h-4 w-4' />
                                        ) : (
                                            <Eye className='h-4 w-4' />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type='submit'
                                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                disabled={loading || passwordScore < 4}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Setting Up...
                                    </>
                                ) : (
                                    'Complete Setup'
                                )}
                            </Button>
                        </form>

                        <div className='text-center'>
                            <Button
                                type='button'
                                variant='ghost'
                                onClick={handleSkip}
                                className='text-sm text-gray-600 hover:text-gray-700'
                                disabled={loading}
                            >
                                Skip for now (Dashboard)
                            </Button>
                        </div>

                        <div className='text-xs text-gray-500 text-center'>
                            <p>You can always add your email later from your profile settings.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
