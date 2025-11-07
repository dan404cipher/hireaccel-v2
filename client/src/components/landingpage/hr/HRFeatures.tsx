import {
    Clock,
    Shield,
    CheckCircle2,
    HandHeart,
    BarChart3,
    ChevronLeft,
    ArrowRight,
    Play,
    Star,
    Zap,
    Users,
    Search,
    FileCheck,
    Calendar,
    Download,
    Mail,
    Phone,
    MessageSquare,
    ExternalLink,
    Plus,
    Minus,
    Target,
    TrendingUp,
    Award,
    Building2,
    Filter,
    AlertTriangle,
    MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
// Removed framer-motion for better performance
import { useEffect, useRef, useState } from 'react';
import { CompetitorComparison } from '@/components/landingpage/hr/CompetitorComparison';
import { Footer } from '@/components/landingpage/Footer';
import { Header } from '../Header';
import { useNavigate } from 'react-router-dom';
import heroBackground from '@/assets/Hero-background.jpeg';
import howItWorksBackground from '@/assets/bg.png';
import problemBackground from '@/assets/section1.jpg';
import featuresBackground from '@/assets/btbg2.jpg';
import UnifiedSignupForm from '@/components/auth/UnifiedSignupForm';

// Hook to detect when element is in view
function useInView(threshold = 0.1) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                }
            },
            { threshold },
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return [ref, isInView] as const;
}

const problemPoints = [
    'Screening hundreds of resumes takes weeks of valuable time.',
    'Public job postings attract countless unqualified applications.',
    'Confidential hiring searches risk candidate and role exposure.',
];

const valueProps = [
    {
        icon: Clock,
        title: 'Lightning Fast',
        description: 'Qualified candidates delivered within 48 hours by our expert agents.',
    },
    {
        icon: Shield,
        title: 'Pre-Vetted',
        description: 'Every profile is manually reviewed, validated, and skillset-verified by our team.',
    },
    {
        icon: CheckCircle2,
        title: 'Fully Confidential',
        description: 'Complete privacy protection — candidates only learn details you approve.',
    },
    {
        icon: HandHeart,
        title: 'Zero Hassle',
        description: 'Post once and relax — we handle sourcing, screening, and shortlisting.',
    },
    {
        icon: BarChart3,
        title: 'Transparent Tracking',
        description: 'Real-time dashboard with detailed submission metrics and feedback loops.',
    },
];

const howItWorksSteps = [
    {
        step: 1,
        title: 'Post Your Job',
        description: 'Complete our 2-minute form with role details, skills, and requirements.',
        color: 'purple',
    },
    {
        step: 2,
        title: 'Our Agents Work',
        description: 'Expert recruiters search, filter, and shortlist the best-fit candidates.',
        color: 'green',
    },
    {
        step: 3,
        title: 'Review Quality Matches',
        description: 'Receive organized candidate profiles with detailed notes in your dashboard.',
        color: 'yellow',
    },
    {
        step: 4,
        title: 'Interview & Hire',
        description: 'Select candidates to interview — we facilitate secure introductions.',
        color: 'blue',
    },
];

const features = [
    {
        icon: HandHeart,
        title: 'White-Glove Job Setup',
        description: 'Our experts help craft job descriptions and set precise targeting filters.',
        micro: 'Perfect for urgent or highly confidential roles.',
        color: 'red',
    },
    {
        icon: Clock,
        title: '48-Hour Delivery Promise',
        description: 'First qualified candidate submissions guaranteed within two business days.',
        micro: 'Binding SLA commitment for all partners.',
        color: 'yellow',
    },
    {
        icon: Shield,
        title: 'Private Candidate Pipeline',
        description: 'Your hiring team only sees pre-approved, agent-curated profiles.',
        micro: 'Complete control over your recruitment channel.',
        color: 'green',
    },
    {
        icon: Target,
        title: 'AI-Enhanced Matching',
        description: 'Smart algorithms plus human expertise identify top-tier talent faster.',
        micro: 'Higher quality, shorter shortlists.',
        color: 'orange',
    },
    {
        icon: BarChart3,
        title: 'Advanced Analytics Dashboard',
        description: 'Track submission timelines, candidate status, and hiring funnel metrics.',
        micro: 'Data-driven recruitment optimization.',
        color: 'purple',
    },
    {
        icon: Download,
        title: 'Seamless ATS Integration',
        description: 'One-click export to CSV or direct integration with major ATS platforms.',
        micro: 'Zero disruption to existing workflows.',
        color: 'blue',
    },
];

const testimonials = [
    {
        quote: 'HireAccel delivered 12 perfectly-matched candidates in 48 hours for our critical project roles. What would have taken our team 3-4 weeks was done in 2 days with better quality results.',
        author: 'Priya Krishnamurthy',
        title: 'Head of Talent Acquisition',
        company: 'InnovateTech Solutions',
    },
    {
        quote: 'Finally, a recruitment partner that understands confidentiality. They helped us build a senior team for our stealth product launch without any information leaks. Exceptional discretion and speed.',
        author: 'Rajesh Menon',
        title: 'VP of Human Resources',
        company: 'GrowthScale Ventures',
    },
    {
        quote: 'HireAccel delivered 12 perfectly-matched candidates in 48 hours for our critical project roles. What would have taken our team 3-4 weeks was done in 2 days with better quality results.',
        author: 'Priya Krishnamurthy',
        title: 'Head of Talent Acquisition',
        company: 'InnovateTech Solutions',
    },
    {
        quote: 'Finally, a recruitment partner that understands confidentiality. They helped us build a senior team for our stealth product launch without any information leaks. Exceptional discretion and speed.',
        author: 'Rajesh Menon',
        title: 'VP of Human Resources',
        company: 'GrowthScale Ventures',
    },
    {
        quote: 'HireAccel delivered 12 perfectly-matched candidates in 48 hours for our critical project roles. What would have taken our team 3-4 weeks was done in 2 days with better quality results.',
        author: 'Priya Krishnamurthy',
        title: 'Head of Talent Acquisition',
        company: 'InnovateTech Solutions',
    },
    {
        quote: 'Finally, a recruitment partner that understands confidentiality. They helped us build a senior team for our stealth product launch without any information leaks. Exceptional discretion and speed.',
        author: 'Rajesh Menon',
        title: 'VP of Human Resources',
        company: 'GrowthScale Ventures',
    },
    {
        quote: 'HireAccel delivered 12 perfectly-matched candidates in 48 hours for our critical project roles. What would have taken our team 3-4 weeks was done in 2 days with better quality results.',
        author: 'Priya Krishnamurthy',
        title: 'Head of Talent Acquisition',
        company: 'InnovateTech Solutions',
    },
    {
        quote: 'Finally, a recruitment partner that understands confidentiality. They helped us build a senior team for our stealth product launch without any information leaks. Exceptional discretion and speed.',
        author: 'Rajesh Menon',
        title: 'VP of Human Resources',
        company: 'GrowthScale Ventures',
    },
];

const faqs = [
    {
        question: 'How do you ensure candidate quality and relevance?',
        answer: 'Our expert recruitment agents manually review every profile, conduct skill verification through portfolio and experience assessment, and apply your specific criteria before submission. Each candidate goes through our multi-stage vetting process, and we maintain detailed quality metrics to continuously improve our matching accuracy.',
    },
    {
        question: "What if I'm not satisfied with the candidate submissions?",
        answer: "We guarantee your satisfaction with unlimited revisions and re-sourcing at no extra cost. Our white-glove onboarding ensures we understand your exact requirements from day one, and we'll keep refining until we deliver candidates who meet your standards.",
    },
    {
        question: 'How do you maintain complete confidentiality for sensitive roles?',
        answer: 'We use a secure, compartmentalized approach where candidates never see your company name, internal details, or sensitive information without your explicit approval. All communications are handled through our encrypted platform, protecting both your organizational privacy and strategic hiring plans.',
    },
    {
        question: 'Can HireAccel integrate with our existing recruitment workflow?',
        answer: 'Absolutely. We support seamless CSV exports and direct API integrations with major ATS platforms like Workday, BambooHR, and Greenhouse. Our technical team provides white-glove setup to ensure zero disruption to your current hiring processes.',
    },
    {
        question: 'What happens when the free beta period ends?',
        answer: "HireAccel will remain completely free for all early partners who join during our beta phase. We'll provide 60+ days advance notice before introducing any pricing for new customers, and early partners will receive grandfathered pricing benefits.",
    },
];

export function HRProfessionals() {
    const navigate = useNavigate();
    const refs = Array(10)
        .fill(null)
        .map(() => useInView());
    const [heroRef, heroInView] = refs[0];
    const [problemRef, problemInView] = refs[1];
    const [howItWorksRef, howItWorksInView] = refs[2];
    const [featuresRef, featuresInView] = refs[3];
    const [socialProofRef, socialProofInView] = refs[4];
    const [faqRef, faqInView] = refs[5];
    const testimonialsSectionHeight = window.innerHeight * 0.25; // 25vh for testimonials
    const faqSectionOffset = testimonialsSectionHeight; // FAQ starts after testimonials

    // Scroll to top on initial load
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className='min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden flex flex-col'>
            {/* Background and accents */}
            <div className='absolute inset-0'>
                {/* Grid Pattern */}
                <div className='absolute inset-0 opacity-10'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `linear-gradient(to right, rgb(59,130,246,0.1) 1px, transparent 1px),linear-gradient(to bottom, rgb(59,130,246,0.1) 1px, transparent 1px)`,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>
                {/* Static elements */}
                {[
                    { class: 'top-20 left-10 w-32 h-32 border border-blue-200/20 rounded-lg rotate-12 opacity-30' },
                    { class: 'top-40 right-20 w-24 h-24 border border-purple-200/20 rounded-full opacity-25' },
                    {
                        class: 'bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-blue-100/15 to-purple-100/15 rounded-lg rotate-45 opacity-20',
                    },
                    {
                        class: 'top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl',
                    },
                    {
                        class: 'top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl',
                    },
                    {
                        class: 'bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-green-400/6 to-blue-400/6 rounded-full blur-3xl',
                    },
                    {
                        class: 'top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-100/10 to-transparent rounded-br-full',
                    },
                    {
                        class: 'top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/10 to-transparent rounded-bl-full',
                    },
                    {
                        class: 'bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-cyan-100/10 to-transparent rounded-tr-full',
                    },
                    {
                        class: 'bottom-0 right-0 w-44 h-44 bg-gradient-to-tl from-pink-100/10 to-transparent rounded-tl-full',
                    },
                ].map((el, i) => (
                    <div key={i} className={`absolute ${el.class}`} />
                ))}
            </div>

            {/* Header with Navigation */}
            <Header
                navItems={[
                    { label: 'How It Works', id: 'how-it-works' },
                    { label: 'Features', id: 'features' },
                    { label: 'Testimonials', id: 'testimonials' },
                    { label: 'FAQ', id: 'faq' },
                    { label: 'Compare', id: 'competitor-comparison' },
                ]}
                showAuthButtons={true}
                showRoleButtons={false}
                getStartedHref='/register/hr'
            />

            {/* 1. Hero Section */}
            <section
                ref={heroRef}
                className='relative min-h-screen flex items-center py-10 md:py-20'
                style={{
                    backgroundImage: `url(${heroBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#F3F6FB', // unify text color
                }}
            >
                {/* Enhanced gradient overlay for better text readability */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10'></div>
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'></div>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent'></div>
                <div className='container mx-auto px-5 md:px-4 py-8 md:py-20 relative z-10 h-full'>
                    <div className='container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                            {/* Left Content */}
                            <div>
                                {/*{/* AI Platform Badge}
              <div className="mb-6">
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  AI-Powered Recruitment Platform
                </Badge>
              </div>*/}

                                {/* Main Headline */}
                                <h1 className='text-2xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-6xl 2xl:text-6xl font-black text-white font-inter leading-tight mb-4'>
                                    <span className='text-white'>
                                        Post a job - Receive
                                        <br />
                                        vetted candidates
                                        <br />
                                    </span>
                                    <span className='text-white'>in 48 Hours</span>
                                </h1>

                                {/* Subtitle */}
                                <div className='mb-8'>
                                    <p className='text-xs sm:text-md md:text-lg lg:text-xl xl-text-xl 2xl:text-xl text-white/80 leading-relaxed font-inter max-w-2xl mx-0 lg:mx-0 mt-8 md:mt-0 mb-4'>
                                        <strong className='text-white'>HireAccel by V-Accel</strong> — Our expert
                                        recruitment agents personally source, screen, and deliver{' '}
                                        <span className='text-blue-300 drop-shadow-[0_0_8px_#00fff7]'>
                                            only qualified candidates
                                        </span>{' '}
                                        to your private dashboard with{' '}
                                        <span className='text-blue-300 drop-shadow-[0_0_8px_#00fff7]'>
                                            complete confidentiality{' '}
                                        </span>{' '}
                                        guaranteed until you approve contact.
                                    </p>
                                    <div className='grid md:grid-cols-3 gap-6 mb-8'>
                                        {[
                                            {
                                                icon: Shield,
                                                title: 'No Hidden Costs',
                                                desc: 'What you see is what you get - forever free',
                                            },
                                            {
                                                icon: Users,
                                                title: 'No User Limits',
                                                desc: 'Add unlimited team members at no extra cost',
                                            },
                                            {
                                                icon: Zap,
                                                title: 'Full Features',
                                                desc: 'Access to all premium features included',
                                            },
                                        ].map((benefit, index) => (
                                            <div
                                                key={index}
                                                className='bg-gray-900 rounded-xl p-4 border border-blue flex flex-col items-center justify-center'
                                            >
                                                <benefit.icon className='w-8 h-8 text-white mb-3 mx-auto drop-shadow-[0_0_2px_#00fff7]' />
                                                <h4 className='font-bold text-white'>{benefit.title}</h4>
                                                <p className='text-sm text-white text-wrap text-center'>
                                                    {benefit.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Value Props */}
                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
                                    <div className='flex items-center space-x-2'>
                                        <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center'>
                                            <Clock className='w-4 h-4 text-white' />
                                        </div>
                                        <span className='text-sm font-medium text-white'>48-Hour Delivery</span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                                            <CheckCircle2 className='w-4 h-4 text-white drop-shadow-[0_0_8px_#00fff7]' />
                                        </div>
                                        <span className='text-sm font-medium text-white'>Pre-Vetted Only</span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center'>
                                            <HandHeart className='w-4 h-4 text-white' />
                                        </div>
                                        <span className='text-sm font-medium text-white'>Zero Hassle</span>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className='flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6'>
                                    <Button
                                        size='lg'
                                        className='bg-gradient-to-r from-blue-900 to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl w-full sm:w-auto'
                                        onClick={() => navigate('/register/hr')}
                                        data-gtm-cta='hr_hero_cta_button'
                                        data-gtm-cta-text='Post unlimited jobs for FREE'
                                        data-gtm-cta-position='hero'
                                        data-gtm-cta-destination='/register/hr'
                                        data-gtm-page='hr_landing'
                                    >
                                        Post unlimited jobs for FREE
                                        <ArrowRight className='w-5 h-5 ml-2' />
                                    </Button>
                                    {/* <Button 
                  variant="outline"
                  size="lg"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg w-full sm:w-auto"
                  onClick={()=>navigate('/register/hr')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch 2-Min Demo
                </Button> */}
                                </div>

                                {/* Trust Indicators */}
                                <div className='flex items-center space-x-6'>
                                    <div className='flex items-center'>
                                        <div className='flex space-x-1'>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className='w-4 h-4 text-yellow-400 fill-current' />
                                            ))}
                                        </div>
                                        <span className='text-sm text-blue-100 ml-2'>Trusted by 50+ HR teams</span>
                                        {/*<span className="text-sm text-[#00fff7] ml-2 drop-shadow-[0_0_8px_#00fff7]">Trusted by 50+ HR teams</span>*/}
                                    </div>
                                </div>
                            </div>

                            {/* Right Dashboard */}
                            <div className='relative '>
                                {/* Dashboard Container */}
                                <div className='rounded-2xl shadow-2xl border border-blue-200/50 overflow-hidden'>
                                    {/* Dashboard Header */}
                                    <div className='bg-gray-900 px-6 py-4 border-b border-blue'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center space-x-2'>
                                                <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                                                <span className='font-semibold text-white'>
                                                    Live Recruitment Dashboard
                                                </span>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Zap className='w-4 h-4 text-white' />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard Content */}
                                    <div className='p-6 bg-gray-800 space-y-6'>
                                        {/* Stats Row */}
                                        <div className='grid grid-cols-2 gap-6'>
                                            <div className='space-y-2'>
                                                <div className='text-3xl font-bold text-white'>12</div>
                                                <div className='text-sm text-white'>Candidates Submitted</div>
                                                <div className='text-xs text-white'>4 of 5 48hrs</div>
                                            </div>
                                            <div className='space-y-2'>
                                                <div className='text-3xl font-bold text-text'>96%</div>
                                                <div className='text-sm text-white'>Quality Match Score</div>
                                                <div className='text-xs text-white'>Above average</div>
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div className='space-y-3'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm font-medium text-blue-100'>
                                                    Screening Progress
                                                </span>
                                                <span className='text-xs text-blue-200'>8/10 Complete</span>
                                            </div>
                                            <div className='w-full bg-white rounded-full h-2'>
                                                <div
                                                    className='bg-blue-300 h-2 rounded-full'
                                                    style={{ width: '80%' }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Interview Ready */}
                                        <div className='space-y-3'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm font-medium text-blue-100'>
                                                    Interview Ready
                                                </span>
                                                <span className='text-xs text-blue-200'>5 Candidates</span>
                                            </div>
                                            <div className='w-full bg-white rounded-full h-3'>
                                                <div
                                                    className='bg-blue-300 h-3 rounded-full'
                                                    style={{ width: '60%' }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            disabled
                                            className='w-full text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg transition duration-200 cursor-no-drop'
                                        >
                                            <Search className='w-4 h-4 mr-2 text-white' />
                                            <span className='text-white'>Review Matches</span>
                                        </Button>

                                        {/* Additional Info */}
                                        <div className='text-center py-2 border-t border-blue-200/50'>
                                            <span className='text-xs text-white'>36 hrs remaining</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Problem Section */}
            <section
                ref={problemRef}
                className='relative min-h-screen flex items-center py-10 md:py-20 bg-black'
                style={{
                    backgroundImage: `url(${problemBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#F3F6FB', // unify text color
                }}
            >
                {/* Enhanced gradient overlay for better text readability */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'></div>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent'></div>
                <div className='container mx-auto px-5 md:px-4 py-8 md:py-20 relative z-10 h-full'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <div className='text-center mb-16'>
                            <div className='max-w-4xl mx-auto'>
                                <h2 className='text-2xl sm:text-2xl md:text-4xl lg:text-6xl font-bold mb-6'>
                                    <span className='text-white'>
                                        Traditional hiring is
                                        <br />
                                        broken and costly
                                    </span>
                                </h2>
                                <p className='text-xs sm:text-md md:text-lg lg:text-xl xl-text-xl 2xl:text-xl text-white leading-relaxed max-w-3xl mx-auto'>
                                    In today's competitive market, outdated recruitment methods waste time, money, and
                                    talent while compromising confidentiality.
                                </p>
                            </div>
                        </div>

                        {/* Problem Cards Grid */}
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16'>
                            {[
                                {
                                    icon: Clock,
                                    title: 'Painfully Slow',
                                    problem: problemPoints[0],
                                    detail: 'Traditional hiring processes can take 3-6 months, causing you to lose top talent to faster competitors',
                                    color: 'purple',
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Prohibitively Expensive',
                                    problem: problemPoints[1],
                                    detail: 'Recruitment costs average $15,000+ per hire when factoring in time, resources, and opportunity costs',
                                    color: 'green',
                                },
                                {
                                    icon: Filter,
                                    title: 'Compromised Privacy',
                                    problem: problemPoints[2],
                                    detail: 'Public job boards expose sensitive company information and strategic hiring plans to competitors',
                                    color: 'yellow',
                                },
                            ].map((item, index) => (
                                <div key={index} className='group'>
                                    <Card
                                        className={`h-full bg-[#10151b] border border-${item.color} shadow-${item.color} transition-all duration-200 overflow-hidden`}
                                    >
                                        <CardContent className='p-8'>
                                            <div className='flex items-center justify-center mb-6'>
                                                <div
                                                    className={`w-16 h-16 bg-${item.color}-500 rounded-2xl flex items-center justify-center`}
                                                >
                                                    <item.icon className='w-8 h-8 text-white' />
                                                </div>
                                            </div>
                                            <h3 className='text-xl font-bold text-white mb-4 text-center'>
                                                {item.title}
                                            </h3>
                                            <div className='space-y-4'>
                                                <div className={`p-4 bg-black rounded-xl border border-${item.color}`}>
                                                    <p className='text-white font-medium text-center'>
                                                        "{item.problem}"
                                                    </p>
                                                </div>
                                                <p className='text-white text-sm leading-relaxed text-center'>
                                                    {item.detail}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Signup Form Section - Second Page */}
            <section
                id="signup"
                className="relative min-h-screen flex items-center justify-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 overflow-hidden"
                style={{
                    backgroundImage: `url(${heroBackground})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>

                {/* Background pattern matching other sections */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/3 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8 md:py-10 relative z-10 w-full">
                    <div className="max-w-4xl mx-auto">
                        {/* Section Header matching page style */}
                        <div className="text-center mb-8 sm:mb-10 md:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-white leading-tight">
                                Create Your Account
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4">
                                Join hundreds of HR professionals transforming their hiring process
                            </p>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-white/30">
                            <UnifiedSignupForm role="hr" variant="inline" />

                            <div className="text-center text-xs sm:text-sm text-gray-600 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    Sign in here
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. How It Works */}
            <section
                id='how-it-works'
                ref={howItWorksRef}
                className='relative min-h-screen flex items-center py-10 md:py-24 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50'
                style={{
                    backgroundImage: `url(${howItWorksBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Enhanced gradient overlay for better text readability */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10'></div>
                <div className='container mx-auto px-5 md:px-4 py-8 md:py-20 relative z-10 h-full'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        {/* Section Header */}
                        <div className='text-center mb-20'>
                            {/*<Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 px-6 py-3 mb-8">
              <Zap className="w-5 h-5 mr-2" />
              Simple 4-Step Process
            </Badge>*/}

                            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6'>
                                <span className='text-white'>How It Works</span>
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed px-4'>
                                From job posting to qualified candidates in 48 hours — here's exactly how our expert
                                recruitment process delivers results
                            </p>
                        </div>

                        {/* Process Flow */}
                        <div className='relative'>
                            {/* Desktop Flow Line */}
                            <div className='hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-5xl'>
                                <div className='relative h-1.5 sm:h-2'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-300 rounded-full opacity-30'></div>
                                    <div className='absolute inset-y-0 left-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full' />
                                </div>

                                {/* Flow Dots */}
                                <div className='absolute inset-0 flex justify-between items-center px-8'>
                                    {howItWorksSteps.map((_, index) => (
                                        <div
                                            key={index}
                                            className='w-4 h-4 bg-white border-4 border-blue-500 rounded-full shadow-lg'
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Steps Grid */}
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10'>
                                {howItWorksSteps.map((step, index) => (
                                    <div key={index} className='relative group h-full'>
                                        {/* Step Card */}
                                        <div
                                            className={`relative bg-black/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/80 hover:border-white transition-all duration-300 shadow-lg hover:shadow-2xl group-hover:scale-105 h-full flex flex-col`}
                                        >
                                            {/* Step Number Circle */}
                                            <div className='flex items-center justify-center mb-4 sm:mb-6 md:mb-8 flex-shrink-0'>
                                                <div className='relative'>
                                                    <div
                                                        className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-${step.color}-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}
                                                    >
                                                        <span className='text-white font-bold text-lg sm:text-xl md:text-2xl'>
                                                            {step.step}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Step Content */}
                                            <div className='text-center space-y-2 sm:space-y-3 md:space-y-4 flex-grow flex flex-col justify-center'>
                                                <h3 className='text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-white transition-colors duration-300'>
                                                    {step.title}
                                                </h3>
                                                <p className='text-sm sm:text-base md:text-lg text-white/90 leading-relaxed flex-grow flex items-center'>
                                                    <span className='w-full'>{step.description}</span>
                                                </p>
                                            </div>

                                            {/* Hover Gradient Border */}
                                            <div
                                                className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-600/10 to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                                            />
                                        </div>

                                        {/* Mobile Flow Arrow */}
                                        {index < howItWorksSteps.length - 1 && (
                                            <div className='lg:hidden flex justify-center mt-6 mb-2'>
                                                <ArrowRight className='w-6 h-6 text-blue-400' />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Bottom CTA Section */}
                            <div className='mt-20 text-center'>
                                <div className='bg-black/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/80 hover:border-white shadow-xl max-w-4xl mx-auto'>
                                    <div className='flex flex-col items-center space-y-4 sm:space-y-6'>
                                        <div
                                            className='flex items-center space-x-2 sm:space-x-3'
                                            onClick={() => navigate('/register/hr')}
                                        >
                                            <Clock className='w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600' />
                                            <span className='text-xl sm:text-2xl font-bold text-white'>
                                                Ready to get started?
                                            </span>
                                        </div>

                                        <p className='text-base sm:text-lg text-white/90 max-w-2xl mx-auto px-4'>
                                            Join 50+ companies that have already streamlined their hiring with our
                                            48-hour guarantee
                                        </p>

                                        <div className='flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto'>
                                            <Button
                                                size='lg'
                                                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg shadow-xl transform hover:scale-105 transition-all duration-300'
                                                onClick={() => navigate('/register/hr')}
                                                data-gtm-cta='hr_how_it_works_cta_button'
                                                data-gtm-cta-text='Start Your First Job Post'
                                                data-gtm-cta-position='how_it_works'
                                                data-gtm-cta-destination='/register/hr'
                                                data-gtm-page='hr_landing'
                                            >
                                                Start Your First Job Post
                                                <ArrowRight className='w-5 h-5 ml-2' />
                                            </Button>{' '}
                                            <div className='flex items-center text-sm text-white'>
                                                <Shield className='w-4 h-4 mr-2 text-green-500' />
                                                No credit card required • 100% Free
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Features */}
            <section
                id='features'
                ref={featuresRef}
                className='relative min-h-screen flex items-center py-10 md:py-20 bg-gray-50/50'
                style={{
                    backgroundImage: `url(${featuresBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Enhanced gradient overlay for better text readability */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10'></div>
                <div className='container mx-auto px-5 md:px-4 py-8 md:py-20 relative z-10 h-full'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <div className='text-center mb-16'>
                            <h2 className='text-2xl sm:text-2xl md:text-4xl lg:text-6xl font-bold mb-4'>
                                <span className='text-white'>Premium Features for HR Teams</span>
                            </h2>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                            {features.map((feature, index) => (
                                <div key={index}>
                                    <Card
                                        className={`h-full bg-black/60 backdrop-blur-sm border border-white-500/30 hover:border-white transition-colors duration-200 overflow-hidden`}
                                    >
                                        <CardContent className='p-6'>
                                            <div className='flex items-center justify-center mb-6'>
                                                <div
                                                    className={`w-16 h-16 bg-${feature.color}-500 rounded-2xl flex items-center justify-center`}
                                                >
                                                    <feature.icon className='w-8 h-8 text-white' />
                                                </div>
                                            </div>
                                            <h3 className='text-xl font-bold text-white mb-3 text-center'>
                                                {feature.title}
                                            </h3>
                                            <p className='text-white text-center mb-4'>{feature.description}</p>
                                            <p className='text-white/80 text-sm text-center font-medium'>
                                                {feature.micro}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section
                id='social-proof'
                ref={socialProofRef}
                className='relative flex flex-col items-center py-10'
                style={{
                    backgroundImage: `url(${heroBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: '0 0',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'scroll',
                }}
            >
                {/* Enhanced gradient overlay for better text readability */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10'></div>
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'></div>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent'></div>
                <div className='container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
                        {/* Testimonials */}
                        <div className='text-center mb-10'>
                            <h2 className='text-2xl sm:text-2xl md:text-4xl lg:text-6xl font-bold mb-4'>
                                <span className='text-white bg-clip-text text-transparent'>
                                    Trusted by Leading Companies
                                </span>
                            </h2>
                        </div>
                        <div className='mb-16 flex flex-col items-center'>
                            {/* Responsive Carousel */}
                            {(() => {
                                const CARD_WIDTH = 340;
                                const CARD_HEIGHT = 420;
                                const GAP = 32;
                                const testimonialCount = testimonials.length;

                                const getVisibleCount = () => {
                                    if (window.innerWidth < 640) return 1;
                                    if (window.innerWidth < 1024) return 2;
                                    return 3;
                                };

                                const [visibleCount, setVisibleCount] = useState(getVisibleCount());
                                useEffect(() => {
                                    const handleResize = () => setVisibleCount(getVisibleCount());
                                    window.addEventListener('resize', handleResize);
                                    return () => window.removeEventListener('resize', handleResize);
                                }, []);

                                const [offset, setOffset] = useState(0);
                                useEffect(() => {
                                    const interval = setInterval(() => {
                                        setOffset((prev) => prev + 1);
                                    }, 20);
                                    return () => clearInterval(interval);
                                }, []);

                                useEffect(() => {
                                    if (offset > testimonialCount * (CARD_WIDTH + GAP)) {
                                        setOffset(0);
                                    }
                                }, [offset, testimonialCount]);

                                return (
                                    <div className='w-full flex flex-col items-center'>
                                        <div
                                            className='relative w-full overflow-hidden'
                                            style={{ height: `${CARD_HEIGHT}px` }}
                                        >
                                            <div
                                                className='flex items-center'
                                                style={{
                                                    gap: `${GAP}px`,
                                                    transform: `translateX(-${offset}px)`,
                                                    transition: 'transform 0.2s linear',
                                                    width: 'max-content',
                                                }}
                                            >
                                                {Array.from({ length: testimonialCount * 2 }).map((_, i) => {
                                                    const idx = i % testimonialCount;
                                                    const t = testimonials[idx];
                                                    return (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                minWidth: CARD_WIDTH,
                                                                maxWidth: CARD_WIDTH,
                                                                height: CARD_HEIGHT,
                                                                display: 'flex',
                                                                alignItems: 'stretch',
                                                            }}
                                                        >
                                                            <Card className='bg-white/10 backdrop-blur-md border border-white/20 hover:border-white-300 transition-colors duration-200 overflow-hidden h-full flex flex-col justify-between'>
                                                                <CardContent className='p-8 h-full flex flex-col justify-between'>
                                                                    <blockquote className='text-white mb-6 text-lg leading-relaxed'>
                                                                        "{t.quote}"
                                                                    </blockquote>
                                                                    <div className='flex items-center mt-auto'>
                                                                        <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4'>
                                                                            <span className='text-white font-bold'>
                                                                                {t.author
                                                                                    .split(' ')
                                                                                    .map((n) => n[0])
                                                                                    .join('')}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className='font-semibold text-white'>
                                                                                {t.author}
                                                                            </div>
                                                                            <div className='text-white/80 text-sm'>
                                                                                {t.title}
                                                                            </div>
                                                                            <div className='text-white/80 text-sm font-medium'>
                                                                                {t.company}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* FAQ */}
                        <div className='text-center mb-10'>
                            <h2 className='text-2xl sm:text-2xl md:text-4xl lg:text-6xl font-bold mb-2'>
                                <span className='text-white bg-clip-text text-transparent'>
                                    Frequently Asked Questions
                                </span>
                            </h2>
                        </div>
                        <Accordion type='single' collapsible className='w-full'>
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    value={`item-${index}`}
                                    key={index}
                                    className='bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden mb-2'
                                >
                                    <AccordionTrigger className='px-6 py-2 text-left font-semibold text-white hover:no-underline'>
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className='px-6 pb-2 text-white leading-relaxed'>
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Competitor Analysis Section */}
            <div id='competitor-comparison'>
                <CompetitorComparison />
            </div>

            {/* Final CTA */}
            <section className='relative py-20 bg-gradient-to-r from-black to-gray-800 text-white'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <div>
                        <h2 className='text-3xl md:text-4xl font-bold mb-4'>
                            Ready to revolutionize your hiring process?
                        </h2>
                        <p className='text-xl mb-8 opacity-90'>
                            Join 50+ companies already using HireAccel and save over ₹3,60,000 per year
                        </p>
                        <Button
                            size='lg'
                            className='bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl'
                            onClick={() => navigate('/register/hr')}
                            data-gtm-cta='hr_final_cta_button'
                            data-gtm-cta-text='Get Started Free - Save ₹3,60,000+'
                            data-gtm-cta-position='final_cta'
                            data-gtm-cta-destination='/register/hr'
                            data-gtm-page='hr_landing'
                        >
                            Get Started Free - Save ₹3,60,000+
                            <ArrowRight className='w-5 h-5 ml-2' />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Contact Support Section */}
            <div className='flex flex-wrap bg-gradient-to-r from-black to-gray-800 justify-center items-center gap-6 py-10'>
                <a
                    href='mailto:info@v-accel.ai'
                    className='group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200/50 hover:border-blue-300 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md'
                >
                    <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3'>
                        <Mail className='w-4 h-4 text-white' />
                    </div>
                    <div>
                        <div className='font-semibold text-gray-800 text-sm'>Email Support</div>
                        <div className='text-blue-600 text-xs'>info@v-accel.ai</div>
                    </div>
                </a>

                <button
                    onClick={() => {
                        const whatsappUrl = 'https://wa.me/919962056381';

                        // Try multiple methods
                        try {
                            // Method 1: Direct navigation
                            window.location.href = whatsappUrl;
                        } catch (error) {
                            console.error('Method 1 failed:', error);
                            try {
                                // Method 2: Open in new tab
                                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                            } catch (error2) {
                                console.error('Method 2 failed:', error2);
                                // Method 3: Create temporary link
                                const link = document.createElement('a');
                                link.href = whatsappUrl;
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }
                        }
                    }}
                    className='group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-green-200/50 hover:border-green-300 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer'
                >
                    <div className='w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3'>
                        <MessageCircle className='w-4 h-4 text-white' />
                    </div>
                    <div>
                        <div className='font-semibold text-gray-800 text-sm'>WhatsApp Support</div>
                        <div className='text-green-600 text-xs'>Instant help available</div>
                    </div>
                </button>
                {/* </div> */}
                {/* <div>
            <div className="font-semibold text-gray-800 text-sm">Email Support</div>
            <div className="text-blue-600 text-xs">info@v-accel.ai</div>
          </div> */}
                {/* </a> */}
                {/* 
        <button 
          onClick={() => {
            console.log('WhatsApp button clicked');
            const whatsappUrl = 'https://wa.me/919962056381';
            console.log('Opening URL:', whatsappUrl);

            // Try multiple methods
            try {
              // Method 1: Direct navigation
              window.location.href = whatsappUrl;
            } catch (error) {
              console.error('Method 1 failed:', error);
              try {
                // Method 2: Open in new tab
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
              } catch (error2) {
                console.error('Method 2 failed:', error2);
                // Method 3: Create temporary link
                const link = document.createElement('a');
                link.href = whatsappUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          }}
          className="group inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200/50 hover:border-green-300 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm">WhatsApp Support</div>
            <div className="text-green-600 text-xs">Instant help available</div>
          </div>
        </button> */}
            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
}
