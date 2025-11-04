import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Users, Clock, TrendingUp, Eye, EyeOff, Mail, Phone, User } from 'lucide-react';
import logoColor from '@/assets/logo-color.png';
import heroBackground from '@/assets/Hero-background.jpeg';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [identifierType, setIdentifierType] = useState<'email' | 'phone' | 'unknown'>('unknown');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (field: string, value: string | boolean) => {
        if (field === 'identifier' && typeof value === 'string') {
            // Detect identifier type
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[0-9\s\-()]{10,}$/;

            if (emailRegex.test(value)) {
                setIdentifierType('email');
            } else if (phoneRegex.test(value.replace(/[\s\-()]/g, ''))) {
                setIdentifierType('phone');
            } else {
                setIdentifierType('unknown');
            }
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const onSwitchToSignup = () => {
        navigate('/signup');
    };

    function StatCard({ value, label }: { value: string; label: string }) {
        return (
            <div className='glass-card rounded-xl p-5 elevated border border-gray-200 shadow-lg'>
                <div className='text-primary font-extrabold'>{value}</div>
                <div className='mt-1 text-sm text-muted-foreground'>{label}</div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(formData.identifier, formData.password);
            toast({
                title: 'Welcome back!',
                description: 'You have been successfully logged in.',
            });
            navigate('/');
        } catch (err: unknown) {
            let errorMessage = 'Failed to login';

            if (err && typeof err === 'object') {
                const error = err as {
                    type?: string;
                    detail?: string;
                    message?: string;
                    response?: { data?: { detail?: string; message?: string } };
                    status?: number;
                };

                if (error.type === 'network_error') {
                    errorMessage = 'Server is under maintenance, please try again';
                } else if (error.detail) {
                    errorMessage = error.detail;
                } else if (error.message) {
                    errorMessage = error.message;
                } else if (error.response?.data?.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.status === 500) {
                    errorMessage = 'Please try again later';
                }

                toast({
                    title: error.type === 'network_error' ? 'Server Under Maintenance' : 'Login Failed',
                    description: errorMessage,
                    variant: 'destructive',
                });
                setError(error);
            } else if (typeof err === 'string') {
                errorMessage = err;
                toast({
                    title: 'Login Failed',
                    description: errorMessage,
                    variant: 'destructive',
                });
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-background flex w-full'>
            {/* Left Side - Branding */}
            <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 relative overflow-hidden w-full  items-center justify-center'>
                {/* Background decorative elements */}
                <div className='absolute inset-0'>
                    <div className='absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-green-200/30 to-green-300/30 rounded-full blur-xl'></div>
                    <div className='absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-blue-200/40 to-blue-300/40 rounded-full blur-lg'></div>
                    <div className='absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-teal-200/20 to-teal-300/20 rounded-full blur-lg'></div>
                    <div className='absolute bottom-1/4 left-20 w-28 h-28 bg-gradient-to-br from-emerald-200/30 to-emerald-300/30 rounded-full blur-xl'></div>
                </div>

                {/* Content container with proper spacing */}
                <div className='relative z-10 flex flex-col h-full'>
                    {/* Header with logo and text */}
                    <div
                        className='flex-shrink-0 p-8 cursor-pointer'
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='flex items-center gap-3'>
                            <img src={logoColor} alt='HireAccel Logo' className='w-12 h-12' />
                            <div>
                                <h1 className='font-bold text-slate-900 text-xl'>Hire Accel</h1>
                                <p className='text-xs text-slate-600 font-medium'>powered by v-accel</p>
                            </div>
                        </div>
                    </div>

                    {/* Central content section */}
                    <div className='flex-1 flex flex-col justify-center px-8'>
                        {/* Left copy */}
                        <div className='mb-8'>
                            <div className='relative mb-8 hidden h-[30vh] w-full rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:block overflow-hidden'>
                                <div
                                    className='w-full h-full bg-cover bg-center bg-no-repeat'
                                    style={{
                                        backgroundImage: `url(${heroBackground})`,
                                    }}
                                />
                            </div>

                            <h1 className='max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl'>
                                Welcome back to{' '}
                                <span className='bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent'>
                                    HireAccel
                                </span>
                            </h1>
                            <p className='mt-4 max-w-xl text-sm leading-6 text-muted-foreground'>
                                Access your AI-powered recruitment dashboard and continue connecting talent with
                                opportunities. Join hundreds of HR professionals transforming their hiring process.
                            </p>

                            <div className='mt-8 grid grid-cols-2 gap-4 max-w-xl'>
                                <StatCard value='300+' label='Ready candidates' />
                                <StatCard value='200+' label='Ready HR Professionals' />
                                <StatCard value='24/7' label='Support' />
                                <StatCard value='100%' label='Free Forever' />
                            </div>

                            <p className='mt-4 hidden text-xs text-muted-foreground'>Server status: Connected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signin Form */}
            <div className='flex-1 flex items-center justify-center p-8'>
                <div className='w-full max-w-md'>
                    <div className='text-center mb-8'>
                        <div className='flex items-center justify-center space-x-1 mb-4'>
                            <div className='w-4 h-4 bg-green-500 rounded-full'></div>
                            <span className='text-sm text-green-500'>Welcome Back</span>
                        </div>
                        <h1 className='text-2xl font-semibold text-gray-900 mb-2'>Sign In to Your Account</h1>
                        <p className='text-gray-600'>Continue your journey with HireAccel</p>
                    </div>

                    <Card className='border-0 shadow-none'>
                        <CardContent className='p-0'>
                            <form onSubmit={handleSubmit} className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='identifier'>Email or Phone Number</Label>
                                    <div className='relative'>
                                        <Input
                                            id='identifier'
                                            type='text'
                                            placeholder='you@company.com or +1234567890'
                                            value={formData.identifier}
                                            onChange={(e) => handleInputChange('identifier', e.target.value)}
                                            required
                                            className='border border-gray-300 focus:border-blue-500 pl-10'
                                        />
                                        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                                            {identifierType === 'email' && <Mail className='h-4 w-4' />}
                                            {identifierType === 'phone' && <Phone className='h-4 w-4' />}
                                            {identifierType === 'unknown' && <User className='h-4 w-4' />}
                                        </div>
                                    </div>
                                    {/* Helper text - uncomment if needed later */}
                                    {/* {identifierType !== 'unknown' && formData.identifier && (
                                        <p className='text-xs text-gray-500'>
                                            {identifierType === 'email' ? 'Email detected' : 'Phone number detected'}
                                        </p>
                                    )} */}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='password'>Password</Label>
                                    <div className='relative'>
                                        <Input
                                            id='password'
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder='Enter your password'
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            required
                                            className='border border-gray-300 focus:border-blue-500 pr-10'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                                        >
                                            {showPassword ? (
                                                <EyeOff className='h-4 w-4' />
                                            ) : (
                                                <Eye className='h-4 w-4' />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className='flex items-center justify-between pt-2'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='rememberMe'
                                            checked={formData.rememberMe}
                                            onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
                                        />
                                        <Label htmlFor='rememberMe' className='text-sm text-gray-600 cursor-pointer'>
                                            Remember me
                                        </Label>
                                    </div>
                                    <button
                                        type='button'
                                        className='text-sm text-blue-600 hover:underline'
                                        onClick={() => navigate('/forget-password')}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <Button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 text-white mt-6'>
                                    Sign In →
                                </Button>

                                <div className='text-center text-sm text-gray-600 mt-4'>
                                    Don't have an account?{' '}
                                    <button
                                        type='button'
                                        onClick={onSwitchToSignup}
                                        className='text-blue-600 hover:underline'
                                    >
                                        Create one here
                                    </button>
                                </div>
                            </form>

                            {/* Welcome message */}
                            <div className='mt-8 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-100'>
                                <p className='text-sm text-gray-700 text-center'>
                                    <strong>Welcome to HireAccel!</strong> Access your dashboard and continue your
                                    hiring journey with powerful recruitment tools.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
