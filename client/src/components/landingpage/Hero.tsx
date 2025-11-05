import { Button } from './ui/button';
import { ArrowRight, Play, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBackground from '@/assets/Hero-background.jpeg';
import { useEffect, useState } from 'react';
import { usePreloadedImage } from '@/utils/imageOptimization';

export function Hero() {
    const navigate = useNavigate();
    const { isLoaded, isLoading } = usePreloadedImage(heroBackground);
    const [hideDemo, setHideDemo] = useState(window.innerWidth >= 800 && window.innerWidth > window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setHideDemo(window.innerWidth >= 800 && window.innerWidth > window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <section
            className='relative min-h-screen flex items-center justify-center overflow-hidden'
            style={{
                backgroundImage: isLoaded ? `url(${heroBackground})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#1a1a1a', // Fallback color while loading
            }}
        >
            {/* Enhanced gradient overlay for better text readability */}
            <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10'></div>
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'></div>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent'></div>

            <div className='container mx-auto px-5 md:px-4 py-8 md:py-20 relative z-10 h-full'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-10 h-full min-h-[80vh] items-center lg:items-start pt-4 md:pt-20'>
                    {/* Main Content */}
                    <div className='col-span-1 lg:col-span-2 flex flex-col space-y-4 md:space-y-8 p-1 md:p-4 text-left lg:text-left w-full'>
                        <div className='space-y-4 md:space-y-4'>
                            <h1 className='text-2xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-black text-white font-inter leading-tight '>
                                FIND THE PERFECT <br></br>
                                <i>TALENT MATCH</i>
                            </h1>
                        </div>

                        <p className='text-xs sm:text-md md:text-lg lg:text-xl xl-text-xl 2xl:text-xl text-white/80 leading-relaxed font-inter max-w-2xl mx-0 lg:mx-0 mt-8 md:mt-0'>
                            A completely free AI-powered recruitment platform for HR professionals and job seekers —
                            featuring unlimited job postings, real-time tracking, specialist agents, and a comprehensive
                            Hire & Train model.
                        </p>

                        {/* Desktop buttons */}
                        <div className='md:flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start'>
                            {/* <Button 
                size="lg" 
                className=" bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full w-full sm:w-auto"
                onClick={() => navigate('/signup/hr')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
              {hideDemo ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-none bg-transparent text-white hover:bg-transparent hover:text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold w-full sm:w-auto"
                  onClick={() => navigate('/signup/candidate')}
                >
                  <Play className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                  Watch Demo
                </Button>):('')
              } */}

                            <Button
                                size='lg'
                                className='bg-blue-800 text-white hover:bg-blue-700 px-8 py-4 text-lg font-semibold'
                                onClick={() => navigate('/register/hr')}
                                data-gtm-cta='home_hero_start_hiring_button'
                                data-gtm-cta-text='Start Hiring'
                                data-gtm-cta-position='hero'
                                data-gtm-cta-destination='/register/hr'
                                data-gtm-page='home'
                            >
                                <Zap className='mr-2 w-5 h-5' />
                                Start Hiring
                            </Button>
                            <Button
                                variant='outline'
                                size='lg'
                                className='text-white bg-purple-800 border-none hover:bg-purple-700 hover:text-white-600 px-8 py-4 text-lg font-semibold'
                                onClick={() => navigate('/register/candidate')}
                                data-gtm-cta='home_hero_find_jobs_button'
                                data-gtm-cta-text='Find Jobs'
                                data-gtm-cta-position='hero'
                                data-gtm-cta-destination='/register/candidate'
                                data-gtm-page='home'
                            >
                                <ArrowRight className='mr-2 w-5 h-5' />
                                Find Jobs
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Empty space or additional content can go here */}
                    <div className='hidden lg:flex flex-col justify-center items-center p-4'>
                        {/* This space is available for future content */}
                    </div>
                </div>

                {/* Mobile button at bottom 
        <div className="hidden absolute bottom-8 left-0 right-0 px-4">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full w-full"
            onClick={() => navigate('/signup/hr')}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Hero Footer Section - Statistics */}
                <div className='hidden md:block absolute bottom-0 left-0 right-0 bg-transparent backdrop-blur-sm border-t border-white/10'>
                    <div className='container mx-auto px-4 py-4 md:py-6'>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8'>
                            <div className='text-center'>
                                <div className='flex items-center justify-center mb-2'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full mr-3'></div>
                                    <span className='text-xl md:text-2xl font-bold text-white font-inter'>300+</span>
                                </div>
                                <p className='text-white/80 text-xs md:text-sm font-inter'>Ready Candidates</p>
                            </div>
                            <div className='text-center'>
                                <div className='flex items-center justify-center mb-2'>
                                    <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                                    <span className='text-xl md:text-2xl font-bold text-white font-inter'>200+</span>
                                </div>
                                <p className='text-white/80 text-xs md:text-sm font-inter'>Professionals</p>
                            </div>
                            <div className='text-center'>
                                <div className='flex items-center justify-center mb-2'>
                                    <div className='w-2 h-2 bg-purple-500 rounded-full mr-3'></div>
                                    <span className='text-xl md:text-2xl font-bold text-white font-inter'>100%</span>
                                </div>
                                <p className='text-white/80 text-xs md:text-sm font-inter'>Free Forever</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
