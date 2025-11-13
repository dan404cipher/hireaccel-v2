import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import logoColor from '@/assets/logo-color.png';
import heroBackground from '@/assets/Hero-background.jpeg';
import UnifiedSignupForm from '@/components/auth/UnifiedSignupForm';

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className='glass-card rounded-xl p-5 elevated border border-gray-200 shadow-lg'>
            <div className='text-primary font-extrabold'>{value}</div>
            <div className='mt-1 text-sm text-muted-foreground'>{label}</div>
        </div>
    );
}

const ForEmployerSignup = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-background flex w-full'>
            {/* Left Side - Branding */}
            <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 relative overflow-hidden w-full items-center justify-center lg:fixed lg:left-0 lg:top-0 lg:h-screen'>
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
                                Join{' '}
                                <span className='bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent'>
                                    HireAccel
                                </span>{' '}
                                as an Employer
                            </h1>
                            <p className='mt-4 max-w-xl text-sm leading-6 text-muted-foreground'>
                                Access your AI-powered recruitment dashboard and start connecting talent with
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

            {/* Right Side - Signup Form */}
            <div className='flex-1 flex items-center justify-center p-8 lg:ml-[50%] lg:min-h-screen lg:overflow-y-auto'>
                <div className='w-full max-w-md'>
                    <div className='text-center mb-6'>
                        <div className='flex items-center justify-center space-x-1 mb-3'>
                            <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                            <span className='text-xs text-blue-500'>Create Account</span>
                        </div>
                        <h1 className='text-xl font-semibold text-gray-900 mb-1.5'>Sign Up as HR Professional</h1>
                        <p className='text-sm text-gray-600'>Join our platform and start your hiring journey</p>
                    </div>

                    <Card className='border-0 shadow-none'>
                        <CardContent className='p-0'>
                            <UnifiedSignupForm role='hr' variant='inline' />

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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ForEmployerSignup;
