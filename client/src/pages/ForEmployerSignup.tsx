import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import logoColor from '@/assets/logo-color.png';
import heroBackground from '@/assets/Hero-background.jpeg';
import { apiClient } from '@/services/api';

const ForEmployerSignup = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('+91');
    const [phoneError, setPhoneError] = useState('');
    const [nameError, setNameError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateName = (name: string): boolean => {
        // Name should contain only letters, spaces, hyphens, and apostrophes
        // Should be at least 2 characters and at most 50 characters
        const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
        return nameRegex.test(name.trim());
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Only allow letters, spaces, hyphens, and apostrophes
        // Filter out numbers and other special characters
        const filtered = value.replace(/[^a-zA-Z\s'-]/g, '');

        setFullName(filtered);

        // Clear error when user starts typing
        if (nameError) {
            setNameError('');
        }
    };

    const validatePhone = (phoneNumber: string): boolean => {
        // Must start with +91 and have exactly 10 more digits
        const phoneRegex = /^\+91[6-9]\d{9}$/;
        return phoneRegex.test(phoneNumber);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // If user tries to delete +91, keep it
        if (!value.startsWith('+91')) {
            setPhone('+91');
            setPhoneError('');
            return;
        }

        // Remove all non-digit characters except the leading +
        const cleaned = value.replace(/[^\d+]/g, '');

        // Ensure it starts with +91
        if (!cleaned.startsWith('+91')) {
            setPhone('+91');
            setPhoneError('');
            return;
        }

        // Limit to +91 + 10 digits (total 13 characters)
        if (cleaned.length <= 13) {
            setPhone(cleaned);

            // Validate as user types
            if (cleaned.length === 13) {
                if (validatePhone(cleaned)) {
                    setPhoneError('');
                } else {
                    setPhoneError('Please enter a valid 10-digit Indian mobile number');
                }
            } else {
                setPhoneError('');
            }
        }
    };

    const handleContinue = async () => {
        // Validate name
        if (!fullName.trim()) {
            setNameError('Name is required');
            return;
        }

        if (!validateName(fullName)) {
            setNameError('Please enter a valid name (2-50 characters, letters only)');
            return;
        }

        setNameError('');

        // Validate phone
        if (!phone.trim() || phone === '+91') {
            setPhoneError('Phone number is required');
            return;
        }

        if (!validatePhone(phone)) {
            setPhoneError('Please enter a valid 10-digit Indian mobile number');
            return;
        }

        setPhoneError('');

        // Start SMS-based signup
        setIsLoading(true);
        try {
            await apiClient.signupSMS({
                phoneNumber: phone,
                firstName: fullName.trim(),
                role: 'hr',
                source: 'Facebook',
            });

            toast({
                title: 'Verification Code Sent',
                description: "We've sent a verification code to your mobile number.",
            });

            // Navigate to SMS OTP verification page
            const params = new URLSearchParams({
                phone: phone,
                name: fullName.trim(),
                role: 'hr',
            });
            navigate(`/auth/verify-sms?${params.toString()}`);
        } catch (error) {
            // Handle specific error cases
            if (error && typeof error === 'object' && 'status' in error) {
                const apiError = error as { status: number; detail?: string };

                if (apiError.status === 409) {
                    toast({
                        title: 'Account Already Exists',
                        description: 'An account with this phone number already exists. Please sign in instead.',
                        variant: 'destructive',
                    });
                    // Optionally redirect to login after a delay
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                    return;
                }
            }

            toast({
                title: 'Signup Failed',
                description: (error as Error).message || 'Failed to send verification code. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className='h-screen relative overflow-hidden flex'
            style={{
                backgroundImage: `url(${heroBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Enhanced gradient overlay for better text readability */}
            <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/40'></div>
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'></div>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-transparent'></div>

            {/* Mobile Header - Logo */}
            <div className='lg:hidden absolute top-0 left-0 right-0 z-20 p-4'>
                <div className='flex items-center gap-3 cursor-pointer hover:opacity-80' onClick={() => navigate('/')}>
                    <img src={logoColor} alt='HireAccel Logo' className='w-10 h-10 sm:w-12 sm:h-12' />
                    <div>
                        <h1 className='font-bold text-white text-lg sm:text-xl'>Hire Accel</h1>
                        <p className='text-xs text-white/80 font-medium'>powered by v-accel</p>
                    </div>
                </div>
            </div>

            {/* Left Side - Content */}
            <div className='hidden lg:flex lg:w-1/2 relative z-10 overflow-hidden'>
                {/* Content container with proper spacing */}
                <div className='relative z-10 flex flex-col h-full w-full'>
                    {/* Header with logo and text */}
                    <div
                        className='flex-shrink-0 p-8 cursor-pointer hover:opacity-80'
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                    >
                        <div
                            className='flex items-center gap-3 animate-fade-in'
                            style={{
                                animationDelay: '0.3s',
                                animationDuration: '1.5s',
                                animationTimingFunction: 'ease-in-out',
                            }}
                        >
                            <img
                                src={logoColor}
                                alt='HireAccel Logo'
                                className='w-12 h-12 hover:scale-110'
                                style={{ transition: 'transform 0.5s ease-in-out' }}
                            />
                            <div>
                                <h1 className='font-bold text-white text-xl'>Hire Accel</h1>
                                <p className='text-xs text-white/80 font-medium'>powered by v-accel</p>
                            </div>
                        </div>
                    </div>

                    {/* Central content section */}
                    <div className='flex-1 flex flex-col justify-center items-center px-8'>
                        <div className='mb-8 text-center'>
                            <h1
                                className='max-w-xl text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-white animate-slide-up mx-auto px-4'
                                style={{
                                    animationDelay: '0.6s',
                                    animationDuration: '1.5s',
                                    animationTimingFunction: 'ease-in-out',
                                }}
                            >
                                Get started as an{' '}
                                <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                                    Employer
                                </span>
                            </h1>
                            <p
                                className='mt-4 max-w-xl text-xs sm:text-sm leading-6 text-white/80 mb-6 animate-slide-up mx-auto px-4'
                                style={{
                                    animationDelay: '1s',
                                    animationDuration: '1.5s',
                                    animationTimingFunction: 'ease-in-out',
                                }}
                            >
                                Share your contact details and continue to complete your HR signup. Join hundreds of HR
                                professionals transforming their hiring process.
                            </p>

                            {/* Stats section as badges */}
                            <div className='flex flex-wrap gap-2 justify-center px-4'>
                                <div
                                    className='bg-blue-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-blue-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left'
                                    style={{
                                        animationDelay: '1.4s',
                                        animationDuration: '1.2s',
                                        animationTimingFunction: 'ease-in-out',
                                        transition: 'all 0.5s ease-in-out',
                                    }}
                                >
                                    <div className='text-sm sm:text-base font-bold text-white'>
                                        5000+ <span className='text-xs font-medium text-white/90'>Active Users</span>
                                    </div>
                                </div>
                                <div
                                    className='bg-purple-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-purple-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left'
                                    style={{
                                        animationDelay: '1.6s',
                                        animationDuration: '1.2s',
                                        animationTimingFunction: 'ease-in-out',
                                        transition: 'all 0.5s ease-in-out',
                                    }}
                                >
                                    <div className='text-sm sm:text-base font-bold text-white'>
                                        200+ <span className='text-xs font-medium text-white/90'>Companies</span>
                                    </div>
                                </div>
                                <div
                                    className='bg-green-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-green-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left'
                                    style={{
                                        animationDelay: '1.8s',
                                        animationDuration: '1.2s',
                                        animationTimingFunction: 'ease-in-out',
                                        transition: 'all 0.5s ease-in-out',
                                    }}
                                >
                                    <div className='text-sm sm:text-base font-bold text-white'>
                                        24/7 <span className='text-xs font-medium text-white/90'>Support</span>
                                    </div>
                                </div>
                                <div
                                    className='bg-orange-500/80 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-orange-400/50 shadow-lg hover:scale-105 hover:shadow-xl animate-slide-in-left'
                                    style={{
                                        animationDelay: '2s',
                                        animationDuration: '1.2s',
                                        animationTimingFunction: 'ease-in-out',
                                        transition: 'all 0.5s ease-in-out',
                                    }}
                                >
                                    <div className='text-sm sm:text-base font-bold text-white'>
                                        98% <span className='text-xs font-medium text-white/90'>Success Rate</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className='flex-1 flex flex-col overflow-y-auto relative z-10'>
                <div className='flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8'>
                    <div
                        className='w-full max-w-md animate-slide-in-right'
                        style={{
                            animationDelay: '0.8s',
                            animationDuration: '1.5s',
                            animationTimingFunction: 'ease-in-out',
                        }}
                    >
                        <div
                            className='bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl hover:shadow-3xl'
                            style={{ transition: 'box-shadow 0.5s ease-in-out' }}
                        >
                            <div className='text-center mb-8'>
                                <div className='flex items-center justify-center space-x-1 mb-4'>
                                    <div className='w-4 h-4 bg-blue-500 rounded-full'></div>
                                    <span className='text-sm text-blue-500'>Create Account as an Employer</span>
                                </div>
                                <p
                                    className='text-gray-600 animate-fade-in'
                                    style={{
                                        animationDelay: '1.2s',
                                        animationDuration: '1.2s',
                                        animationTimingFunction: 'ease-in-out',
                                    }}
                                >
                                    Join our platform and start your hiring journey
                                </p>
                            </div>

                            <form
                                className='space-y-4'
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleContinue();
                                }}
                            >
                                <div className='space-y-2'>
                                    <Label htmlFor='fullName'>Full name*</Label>
                                    <Input
                                        id='fullName'
                                        type='text'
                                        placeholder='Jane Doe'
                                        value={fullName}
                                        onChange={handleNameChange}
                                        onBlur={() => {
                                            if (!fullName.trim()) {
                                                setNameError('Name is required');
                                            } else if (!validateName(fullName)) {
                                                setNameError(
                                                    'Please enter a valid name (2-50 characters, letters only)',
                                                );
                                            }
                                        }}
                                        required
                                        className={nameError ? 'border-red-500 focus:border-red-500' : ''}
                                    />
                                    {nameError && <p className='text-sm text-red-500'>{nameError}</p>}
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='phone'>Phone number*</Label>
                                    <Input
                                        id='phone'
                                        type='tel'
                                        placeholder='+91 9876543210'
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        onBlur={() => {
                                            if (phone.length < 13) {
                                                setPhoneError('Phone number must be 10 digits');
                                            }
                                        }}
                                        required
                                        className={phoneError ? 'border-red-500 focus:border-red-500' : ''}
                                    />
                                    {phoneError && <p className='text-sm text-red-500'>{phoneError}</p>}
                                </div>
                                <Button
                                    type='submit'
                                    disabled={isLoading}
                                    className='w-full bg-blue-600 hover:bg-blue-700 text-white mt-2 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                                    style={{ transition: 'all 0.5s ease-in-out' }}
                                >
                                    {isLoading ? 'Sending Code...' : 'Continue as an Employer →'}
                                </Button>
                            </form>

                            <div className='text-center text-sm text-gray-600 mt-4'>
                                Already have an account?{' '}
                                <button
                                    type='button'
                                    onClick={() => navigate('/login')}
                                    className='text-blue-600 hover:underline'
                                >
                                    Sign in here
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForEmployerSignup;
