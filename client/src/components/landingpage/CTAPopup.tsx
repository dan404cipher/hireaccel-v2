import { useState, useEffect, useRef } from 'react';
import { X, Star, Upload, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CTAPopupProps {
    role: 'candidate' | 'hr';
    initialDelay?: number; // Initial delay in seconds (default 10)
}

export function CTAPopup({ role, initialDelay = 10 }: CTAPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [showCount, setShowCount] = useState(0);
    const navigate = useNavigate();
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        // Check if user has permanently dismissed the popup
        const permanentlyDismissed = sessionStorage.getItem(`cta-popup-${role}-dismissed`);

        if (permanentlyDismissed) {
            return;
        }

        // Show popup exactly 3 times: at 10s, 60s, and 120s
        const showPopup = (count: number) => {
            setIsVisible(true);
            setShowCount(count);
        };

        // Schedule all 3 popups
        // 1st: after 10 seconds
        const timer1 = setTimeout(() => {
            showPopup(1);
        }, initialDelay * 1000);

        // 2nd: after 60 seconds
        const timer2 = setTimeout(() => {
            showPopup(2);
        }, 60 * 1000);

        // 3rd: after 120 seconds
        const timer3 = setTimeout(() => {
            showPopup(3);
        }, 120 * 1000);

        timersRef.current = [timer1, timer2, timer3];

        return () => {
            timersRef.current.forEach((timer) => clearTimeout(timer));
        };
    }, [initialDelay, role]);

    // Exit intent detection - show alert when user tries to leave
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const permanentlyDismissed = sessionStorage.getItem(`cta-popup-${role}-dismissed`);

            if (!permanentlyDismissed) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requires returnValue to be set
                return ''; // Some browsers show this message
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const permanentlyDismissed = sessionStorage.getItem(`cta-popup-${role}-dismissed`);
                if (!permanentlyDismissed && !isVisible) {
                    // User is leaving - show popup immediately
                    setIsVisible(true);
                }
            }
        };

        // Detect mouse leaving viewport (going to address bar/back button)
        const handleMouseLeave = (e: MouseEvent) => {
            const permanentlyDismissed = sessionStorage.getItem(`cta-popup-${role}-dismissed`);

            if (!permanentlyDismissed && e.clientY < 10 && !isVisible) {
                // Mouse is near top of screen - likely going to close/back
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [role, isVisible]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
            // Don't set dismissed here - allow it to show again
        }, 300);
    };

    const handlePermanentDismiss = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
            sessionStorage.setItem(`cta-popup-${role}-dismissed`, 'true');
            // Clear all timers
            timersRef.current.forEach((timer) => clearTimeout(timer));
        }, 300);
    };

    const handleCTA = () => {
        const destination = role === 'candidate' ? '/register/candidate' : '/register/hr';
        sessionStorage.setItem(`cta-popup-${role}-dismissed`, 'true');
        // Clear all timers
        timersRef.current.forEach((timer) => clearTimeout(timer));
        navigate(destination);
    };

    if (!isVisible) return null;

    const content = {
        candidate: {
            title: 'Join the success stories',
            description: 'Be the next professional to land your dream job. It takes just 2 minutes to get started.',
            buttonText: 'Upload Your CV Now',
            buttonIcon: Upload,
            stats: [
                { icon: Shield, text: 'Free Forever', color: 'text-green-500' },
                { icon: Clock, text: '2-minute setup', color: 'text-blue-500' },
                { icon: CheckCircle2, text: 'No spam, guaranteed', color: 'text-purple-500' },
            ],
        },
        hr: {
            title: 'Ready to get started?',
            description: 'Join 50+ companies that have already streamlined their hiring with our platform.',
            buttonText: 'Start Hiring Now',
            buttonIcon: Star,
            stats: [
                { icon: Shield, text: 'No Setup Fee', color: 'text-green-500' },
                { icon: Clock, text: '5-minute setup', color: 'text-blue-500' },
                { icon: CheckCircle2, text: 'Cancel anytime', color: 'text-purple-500' },
            ],
        },
    };

    const data = content[role];
    const ButtonIcon = data.buttonIcon;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                    isClosing ? 'opacity-0' : 'opacity-100'
                }`}
                onClick={handleClose}
            />

            {/* Popup */}
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
                <div
                    className={`pointer-events-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-10 border-2 border-blue-500/50 shadow-2xl backdrop-blur-sm max-w-2xl w-full mx-4 transform transition-all duration-300 ${
                        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                    }`}
                    style={{
                        animation: isClosing ? 'none' : 'slideUp 0.3s ease-out',
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 group'
                        aria-label='Close popup'
                    >
                        <X className='w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300' />
                    </button>

                    {/* Content */}
                    <div className='flex flex-col items-center space-y-6 text-center'>
                        {/* Icon */}
                        <div className='relative'>
                            <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse'>
                                <Star className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                            </div>
                            {/* Glow effect */}
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse'></div>
                        </div>

                        {/* Title */}
                        <h3 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight'>
                            {data.title}
                        </h3>

                        {/* Description */}
                        <p className='text-base sm:text-lg text-white/90 max-w-xl leading-relaxed px-4'>
                            {data.description}
                        </p>

                        {/* CTA Button */}
                        <Button
                            size='lg'
                            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto'
                            onClick={handleCTA}
                            data-gtm-cta={`${role}_popup_cta_button`}
                            data-gtm-cta-text={data.buttonText}
                            data-gtm-cta-position='popup'
                            data-gtm-cta-destination={`/register/${role}`}
                            data-gtm-page={`${role}_landing`}
                        >
                            {data.buttonText}
                            <ButtonIcon className='w-5 h-5 ml-2' />
                        </Button>

                        {/* Trust Indicators */}
                        <div className='flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-sm sm:text-base'>
                            {data.stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className='flex items-center text-white/90'>
                                        <Icon className={`w-4 h-4 mr-2 ${stat.color}`} />
                                        {stat.text}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Close text */}
                        <div className='flex flex-col items-center gap-2'>
                            <button
                                onClick={handleClose}
                                className='text-sm text-white/60 hover:text-white/80 transition-colors duration-200 underline'
                            >
                                Maybe later
                            </button>
                            <button
                                onClick={handlePermanentDismiss}
                                className='text-xs text-white/40 hover:text-white/60 transition-colors duration-200'
                            >
                                Don't show this again
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for animation */}
            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
}
