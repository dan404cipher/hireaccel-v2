import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Smartphone, Mail } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface SMSSignupPageProps {
    onSwitchToSignin?: () => void;
}

interface FormData {
    phoneNumber: string;
    firstName: string;
    role: 'hr' | 'candidate';
    source: string;
}

export function SMSSignupPage({ onSwitchToSignin }: SMSSignupPageProps): React.JSX.Element {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [signupMethod, setSignupMethod] = useState<'sms' | 'email'>('sms');
    const [formData, setFormData] = useState<FormData>({
        phoneNumber: '',
        firstName: '',
        role: 'candidate',
        source: '',
    });
    const [error, setError] = useState('');

    const sourceOptions = [
        'Email',
        'WhatsApp',
        'Telegram',
        'Instagram',
        'Facebook',
        'Journals',
        'Posters',
        'Brochures',
        'Forums',
        'Google',
        'Conversational AI (GPT, Gemini etc)',
    ];

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const formatPhoneNumber = (phone: string): string => {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');

        // If it's 10 digits starting with 6-9, add +91
        if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
            return '+91' + cleaned;
        }

        // If it already has 91 prefix, add +
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return '+' + cleaned;
        }

        // Return as is if already formatted
        return phone;
    };

    const validateForm = (): boolean => {
        if (!formData.firstName.trim()) {
            setError('Name is required');
            return false;
        }

        if (!formData.phoneNumber.trim()) {
            setError('Phone number is required');
            return false;
        }

        const formatted = formatPhoneNumber(formData.phoneNumber);
        if (!/^\+91[6-9]\d{9}$/.test(formatted)) {
            setError('Please enter a valid Indian mobile number');
            return false;
        }

        if (!formData.source) {
            setError('Please select how you heard about us');
            return false;
        }

        return true;
    };

    const handleSMSSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const signupData = {
                phoneNumber: formatPhoneNumber(formData.phoneNumber),
                name: formData.firstName.trim(),
                role: formData.role,
                source: formData.source,
            };

            const response = await apiClient.signupSMS(signupData);

            if (!response.success) {
                throw new Error('Signup failed');
            }

            toast({
                title: 'Verification Required',
                description: response.data?.message || 'Please check your SMS for the verification code.',
            });

            // Navigate to SMS OTP verification page
            navigate('/auth/verify-sms-otp', {
                state: {
                    phoneNumber: signupData.phoneNumber,
                    userType: formData.role,
                    firstName: formData.firstName,
                },
                replace: true,
            });
        } catch (error: unknown) {
            let errorMessage = 'Something went wrong. Please try again.';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'detail' in error) {
                errorMessage = (error as { detail: string }).detail;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchToEmail = () => {
        const signupPath = formData.role === 'candidate' ? '/signup/candidate' : '/signup/hr';
        navigate(signupPath);
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <div className='flex items-center justify-center space-x-1 mb-4'>
                        <div className='w-4 h-4 bg-blue-500 rounded-full'></div>
                        <span className='text-sm text-blue-500'>Quick Signup</span>
                    </div>
                    <p className='text-gray-600'>Join our platform in seconds with your mobile number</p>
                </div>

                <Card className='border-0 shadow-lg'>
                    <CardHeader className='text-center pb-4'>
                        <CardTitle className='text-2xl font-bold text-gray-900'>Create Account</CardTitle>
                        <CardDescription>Get started with just your mobile number</CardDescription>
                    </CardHeader>

                    <CardContent className='space-y-6'>
                        <Tabs
                            value={formData.role}
                            onValueChange={(value) => handleInputChange('role', value as 'hr' | 'candidate')}
                        >
                            <TabsList className='grid w-full grid-cols-2'>
                                <TabsTrigger value='candidate' className='flex items-center gap-2'>
                                    <Smartphone className='h-4 w-4' />
                                    Job Seeker
                                </TabsTrigger>
                                <TabsTrigger value='hr' className='flex items-center gap-2'>
                                    <Mail className='h-4 w-4' />
                                    Recruiter
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {error && (
                            <Alert variant='destructive'>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSMSSignup} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='firstName'>Full Name</Label>
                                <Input
                                    id='firstName'
                                    type='text'
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    placeholder='Enter your full name'
                                    disabled={loading}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='phoneNumber'>Mobile Number</Label>
                                <Input
                                    id='phoneNumber'
                                    type='tel'
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    placeholder='Enter your mobile number'
                                    disabled={loading}
                                />
                                <p className='text-xs text-gray-500'>We'll send a verification code to this number</p>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='source'>How did you hear about us?</Label>
                                <Select
                                    value={formData.source}
                                    onValueChange={(value) => handleInputChange('source', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select an option' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sourceOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type='submit'
                                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Sending Code...
                                    </>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </Button>
                        </form>

                        <div className='text-center space-y-2'>
                            <Button
                                type='button'
                                variant='ghost'
                                onClick={handleSwitchToEmail}
                                className='text-sm text-gray-600 hover:text-gray-700'
                            >
                                Prefer email signup instead?
                            </Button>

                            {onSwitchToSignin && (
                                <div>
                                    <span className='text-sm text-gray-600'>Already have an account? </span>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        onClick={onSwitchToSignin}
                                        className='text-sm text-blue-600 hover:text-blue-700 p-0 h-auto'
                                    >
                                        Sign in
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
