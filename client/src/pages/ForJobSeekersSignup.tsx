import { useNavigate } from 'react-router-dom';
import logoColor from '@/assets/logo-color.png';
import heroBackground from '@/assets/Hero-background.jpeg';
import UnifiedSignupForm from '@/components/auth/UnifiedSignupForm';

const ForJobSeekersSignup = () => {
    const navigate = useNavigate();

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
                <div
                    className='flex items-center gap-3 cursor-pointer hover:opacity-80'
                    onClick={() => navigate('/')}
                    data-gtm-nav='candidate_signup_logo_home'
                    data-gtm-location='signup_page_mobile'
                >
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
                        data-gtm-nav='candidate_signup_logo_home'
                        data-gtm-location='signup_page_desktop'
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
                                Get started as a{' '}
                                <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                                    Job Seeker
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
                                Share your contact details and continue to complete your Candidate signup. Join hundreds
                                of job seekers finding their dream jobs.
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
                    <div className='w-full max-w-md'>
                        <div
                            className='bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl hover:shadow-3xl'
                            style={{ transition: 'box-shadow 0.5s ease-in-out' }}
                        >
                            <UnifiedSignupForm role='candidate' />

                            <div className='text-center text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200'>
                                Already have an account?{' '}
                                <button
                                    type='button'
                                    onClick={() => navigate('/login')}
                                    className='text-blue-600 hover:underline font-medium'
                                    data-gtm-nav='candidate_signup_signin_link'
                                    data-gtm-location='signup_page'
                                    data-gtm-destination='/login'
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

export default ForJobSeekersSignup;
