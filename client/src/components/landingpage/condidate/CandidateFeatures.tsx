import { 
  Clock, 
  Shield, 
  CheckCircle2, 
  Upload,
  Target,
  Bell,
  BarChart3,
  ArrowRight,
  Star,
  Users,
  FileText,
  Eye,
  MessageSquare,
  Award,
  Building2,
  Calendar,
  Mail,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
// Removed framer-motion for better performance
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/landingpage/Footer";
import { Card } from "@/components/ui/card";
import { CardContent } from "../ui/card";
import { Header } from "../Header";
import { useNavigate } from "react-router-dom";
import condidate from '@/assets/candidate.png';
import heroBackground from "@/assets/Hero-background.jpeg";
import howItWorksBackground from "@/assets/section1.jpg";
import testimonialsbg from "@/assets/btbg2.jpg";
import deepbenefitsbg from "@/assets/bg.png";
import featurecomparebg from "@/assets/bg.webp";

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
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
}

interface JobCandidatesProps {
  onBackToHome: () => void;
}

const quickBenefits = [
  {
    icon: Target,
    text: "Get discovered by hiring teams — without applying multiple times.",
    color: "red"
  },
  {
    icon: Upload,
    text: "Resume parsing saves you time — fill profile automatically.",
    color: "blue"
  },
  {
    icon: Shield,
    text: "You control visibility — we only share if you consent to submissions.",
    color: "green"
  }
];

const howItWorksSteps = [
  {
    step: 1,
    title: "Upload CV or create profile",
    description: "Takes just 2 minutes to get started.",
    icon: Upload,
    color: "blue"
  },
  {
    step: 2,
    title: "Our agents review, validate & tag skills",
    description: "Expert recruiters analyze and categorize your profile.",
    icon: CheckCircle2,
    color: "green"
  },
  {
    step: 3,
    title: "Agents submit matching profiles to hiring teams",
    description: "Within 48 hours, we match you with relevant opportunities.",
    icon: Target,
    color: "red"
  },
  {
    step: 4,
    title: "Get interview invites",
    description: "Decide which companies to talk to on your terms.",
    icon: Calendar,
    color: "purple"
  }
];

const features = [
  {
    icon: FileText,
    title: "Resume parser + auto-fill",
    description: "Upload Word/PDF; we extract education, experience & skills so you don't type.",
    micro: "Fills most fields automatically — verify in one click.",
    color: "blue"
  },
  {
    icon: BarChart3,
    title: "Profile progress bar",
    description: "Reach 80% and you become discoverable to agents.",
    micro: "Profiles at 80% get 3× more matches.",
    color: "green"
  },
  {
    icon: Award,
    title: "Skill tags & role signals",
    description: "Choose top 5 skills to appear in agent searches.",
    micro: "Pick the skills you want to be contacted for.",
    color: "red"
  },
  {
    icon: Eye,
    title: "Privacy & control",
    description: "Contact details hidden until you approve an introduction.",
    micro: "We never reveal your phone/email to companies without your OK.",
    color: "purple"
  },
  {
    icon: Bell,
    title: "Match notifications",
    description: "SMS/WhatsApp + email alerts when you're submitted.",
    micro: "Immediate push notification when an agent submits your profile.",
    color: "yellow"
  },
  {
    icon: MessageSquare,
    title: "Interview prep nudges",
    description: "Quick tips for first call, document checklist, and calendar link suggestion.",
    micro: "Get a short message with interview tips when a company expresses interest.",
    color: "orange"
  }
];

const testimonials = [
  {
    quote: "I uploaded my CV and got two interview invites in 72 hours — simple and private.",
    author: "Asha R.",
    location: "Chennai",
    role: "Software Developer"
  },
  {
    quote: "The parser filled most fields for me; agents handled the outreach.",
    author: "Rohit S.",
    location: "Bengaluru", 
    role: "QA Engineer"
  }
];

const benefits = [
  {
    icon: Users,
    title: "Better reach than applying individually",
    description: "Our agents work with hiring teams — we surface you where fits exist.",
    color: "blue"
  },
  {
    icon: Clock,
    title: "Time-saver",
    description: "One profile = multiple opportunities. Spend 2 minutes now to get continuous exposure.",
    color: "red"
  },
  {
    icon: Shield,
    title: "Confidential",
    description: "You keep control; we only share after you approve.",
    color: "green"
  },
  {
    icon: CheckCircle2,
    title: "Interview-ready",
    description: "Agents include context & short notes with each submission so recruiters see a quick fit summary.",
    color: "yellow"
  }
];

const faqs = [
  {
    question: "How much does it cost?",
    answer: "Free for candidates during launch. Agents submit your profile to hiring teams at no charge."
  },
  {
    question: "Will companies contact me directly?",
    answer: "No — companies receive profiles only when our agents submit them and you have consented. Your personal contact is hidden until you approve an intro."
  },
  {
    question: "How long until I hear back?",
    answer: "Agents aim to submit first matches within 48 hours of job posting or profile readiness. Response time from companies varies."
  },
  {
    question: "What documents are required?",
    answer: "CV/Resume (PDF/DOCX) — optional photo; education and experience. The parser extracts the rest."
  },
  {
    question: "Can I apply to jobs directly?",
    answer: "Initially, matching is agent-driven. We'll add in-product 'apply' flows later; for now agents do submissions to hiring teams."
  }
];

export function JobCandidates() {
  const navigate = useNavigate();
  const [heroRef, heroInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [testimonialsRef, testimonialsInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [deepBenefitsRef, deepBenefitsInView] = useInView();
  const [faqRef, faqInView] = useInView();

  const [profileProgress, setProfileProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setProfileProgress(80), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Debug log to ensure features array is available
  useEffect(() => {
    console.log('Features array:', features);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Enhanced Theme Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl"></div>
      </div>

      <Header 
        navItems={[
          { label: "How It Works", id: "how-it-works" },
          { label: "Features", id: "features" },
          { label: "Testimonials", id: "testimonials" },
          { label: "Benefits", id: "benefits" },
          { label: "FAQ", id: "faq" }
        ]}
        showAuthButtons={true}
      />

      {/* 1. Enhanced Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center py-10"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
        <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content - 7 columns */}
              <div
                className="lg:col-span-7"
              >

                <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-white bg-clip-text text-transparent">
                    Skip the job hunt.
                  </span>
                  <br />
                  <span className="text-white">
                    Let opportunities find you.
                  </span>
                </h1>

                <div className="text-xs sm:text-md md:text-lg lg:text-xl xl-text-xl 2xl:text-xl text-white/80 mb-8 leading-relaxed">
                  <p className="mb-4">
                    <strong className="text-white/80">Upload once. Get matched forever.</strong>
                  </p>
                  <p>
                    Our expert agents work 24/7 to match your profile with hiring teams. 
                    You'll receive <span className="text-blue-300 drop-shadow-[0_0_8px_#00fff7]">interview invites directly</span> — no more applications, no more waiting.
                  </p>
                </div>

                {/* Success Stats */}
                <div
                  className="flex flex-wrap items-center gap-6 mb-8"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">73% get interviews in 48 hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">2-minute setup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">100% confidential</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-2xl w-full sm:w-auto"
                    onClick={()=>navigate('/signup/candidate')}
                  >
                    Get matched in 2 minutes
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg w-full sm:w-auto font-semibold"
                    onClick={()=>navigate('/signup/candidate')}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Just upload CV
                  </Button>
                </div>

                <div className="flex items-center space-x-4 text-sm text-white">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1 text-green-500" />
                    <span>Your info stays private until you approve</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>Free forever</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Content - 5 columns */}
              <div
                className="lg:col-span-5 relative"
              >
                {/* Background Image */}
                <div className="relative mb-6">
                  <img
                    src={condidate}
                    alt="Diverse professionals working together representing career success"
                    className="w-full h-80 object-cover rounded-3xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent rounded-3xl"></div>
                </div>

                {/* Dashboard Mockup */}
                <div
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-xl"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-white">Your Profile</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Profile strength:</span>
                      <span className="font-semibold text-white">{profileProgress}%</span>
                    </div>
                    <Progress value={profileProgress} className="h-3" />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-xs text-white/90">Companies viewing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">3</div>
                        <div className="text-xs text-white/90">Interview requests</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Activity Feed */}
                <div
                  className="mt-4 bg-gradient-to-r from-gray-900/50 to-gray-500/10 rounded-xl p-4 border border-blue-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Live agent activity</span>
                    </div>
                    <span className="text-xs text-white/80">2 min ago</span>
                  </div>
                  <p className="text-sm text-white/90 mt-2">
                    Your profile submitted to senior developer role at FinTech startup
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quickBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3"
                >
                  <div className={`w-12 h-12 bg-${benefit.color}-500 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-medium">{benefit.text}</p>
                </div>
              ))}
            </div>

            <div
              className="text-center mt-8"
            >
              <p className="text-white/80 font-medium">No fees. No hassle. Just one profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How Matching Works - Enhanced Theme Integration */}
      <section id="how-it-works" ref={stepsRef} className="relative  min-h-screen flex felx-col items-center py-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden"
        style={{
          backgroundImage: `url(${howItWorksBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
        <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Header */}
            <div
              className="text-center mb-20"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-8 text-white bg-clip-text text-transparent leading-tight">
                How Matching<br />Works
              </h2>
              <p className="text-lg md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                Simple 4-step process powered by AI to get you directly connected with hiring teams looking for your exact skills and experience.
              </p>
            </div>

            {/* Enhanced Process Flow */}
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {howItWorksSteps.map((step, index) => (
                  <div
                    key={index}
                    className="relative group"
                  >
                    {/* Enhanced Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/30 to-gray-500/30 rounded-3xl p-8 border-2 border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-200 backdrop-blur-sm overflow-hidden h-full">
                      {/* Step Number Badge - Enhanced */}
                      <div className={`absolute -top-4 -right-4 w-16 h-16 bg-${step.color}-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white z-10`}>
                        <span className="text-md md:text-lg lg:text-xl font-bold text-white">
                          {step.step}
                        </span>
                      </div>

                      {/* Icon Container - Enhanced */}
                      <div className="flex items-center justify-center mb-8">
                        <div className="relative">
                          <div className={`w-20 h-20 bg-${step.color}-500 rounded-3xl flex items-center justify-center shadow-lg`}>
                            <step.icon className="w-10 h-10 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="text-center">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-4">
                          {step.title}
                        </h3>
                        <p className="text-white/80 leading-relaxed text-md md:text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Enhanced Bottom Text & CTA */}
            <div
              className="text-center mt-10"
            >
              <div className="bg-gray-900/10 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm max-w-4xl mx-auto">
                <p className="text-sm md:text-md lg:text-lg text-white mb-6 leading-relaxed">
                  We log every submission with agent notes and timestamps — your activity stays private until you approve any introduction. 
                  <span className="font-semibold text-blue-300 drop-shadow-[0_0_8px_#00fff7]"> Complete transparency, total control.</span>
                </p>
                
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-sm md:text-md lg:text-xl shadow-xl"
                  onClick={()=>navigate('/signup/candidate')}
                >
                  Experience the Magic
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Designed for Job Seekers */}
      <section id="features" ref={featuresRef} className="relative min-h-screen flex flex-col justify-center items-center py-10 bg-white"
        style={{
          backgroundImage: `url(${featurecomparebg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
        <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
                <span className="text-white bg-clip-text text-transparent">
                  Everything You Need
                </span>
                <br />
                <span className="text-white/90">to Get Hired</span>
              </h2>

              <p className="text-sm sm:text-md md:text-lg lg:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                Built specifically for job seekers who want complete control over their career opportunities
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {features && features.length > 0 ? features.map((feature, index) => (
                <div
                  key={index}
                  className="group"
                >
                  <Card className="h-full bg-gray-900/80 border border-gray-200/50 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                    <CardContent className="p-6">
                      {/* Icon */}
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-16 h-16 bg-${feature.color}-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-4">
                        <h3 className="text-md md:text-lg lg:text-xl font-bold text-white/90 group-hover:text-white transition-colors duration-300">
                          {feature.title}
                        </h3>

                        <p className="text-white/80 leading-relaxed">
                          {feature.description}
                        </p>

                        {/* Micro Detail */}
                        <div className="bg-gray-900 rounded-xl p-2 border border-gray-200/30">
                          <p className="text-sm text-white font-medium">
                            {feature.micro}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg">Loading features...</div>
                </div>
              )}
            </div>

            {/* Bottom Stats */}
            <div
              className="bg-gray-900/50 rounded-3xl p-8 border border-purple-200/50 shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-600">300+</div>
                  <div className="text-white">Ready-to-Join Candidates</div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-pink-600">48hrs</div>
                  <div className="text-white">Average Response Time</div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-600">73%</div>
                  <div className="text-white">Get Interviews Within 2 Days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 4. Proof & Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="relative min-h-screen flex flex-col justify-center items-center py-10 bg-gradient-to-br from-white via-gray-50/30 to-white"
        style={{
          backgroundImage: `url(${testimonialsbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
        <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
                <span className="text-white bg-clip-text text-transparent">
                  Real Results from
                </span>
                <br />
                <span className="text-white/90">Real Candidates</span>
              </h2>

              <p className="text-md md:text-lg lg:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                Join professionals who've already transformed their job search with our platform
              </p>
            </div>

            {/* Trust Metrics */}
            <div
              className="mb-10"
            >
              <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/50 to-gray-50/10 rounded-3xl p-8 border border-blue-200/30 shadow-lg backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div
                    className="space-y-3"
                  >
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      300+
                    </div>
                    <div className="text-white font-medium">Candidates in pool</div>
                    <div className="text-sm text-white">Ready to join immediately</div>
                  </div>

                  <div
                    className="space-y-3"
                  >
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      1,200+
                    </div>
                    <div className="text-white font-medium">Matches sent this month</div>
                    <div className="text-sm text-white">Direct to hiring teams</div>
                  </div>

                  <div
                    className="space-y-3"
                  >
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      48hrs
                    </div>
                    <div className="text-white font-medium">Avg time to first submission</div>
                    <div className="text-sm text-white">Industry-leading speed</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Company Trust Section */}
            <div
              className="mb-16"
            >
              <div className="text-center">
                <p className="text-md md:text-md lg:text-lg text-white mb-8 font-medium">
                  Profiles viewed by hiring teams at leading companies
                </p>
                <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/50 to-gray-50/10 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
                  <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-8 h-8 text-blue-600" />
                      <span className="font-semibold text-white">TechCorp</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-8 h-8 text-purple-600" />
                      <span className="font-semibold text-white">InnovateLabs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-8 h-8 text-green-600" />
                      <span className="font-semibold text-white">StartupVentures</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-8 h-8 text-orange-600" />
                      <span className="font-semibold text-white">GrowthTech</span>
                    </div>
                  </div>
                  <p className="text-sm text-white mt-4">Representative companies in our network</p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  quote: "I uploaded my CV and got two interview invites in 72 hours — simple and private.",
                  author: "Asha R.",
                  location: "Chennai",
                  role: "Software Developer",
                  image: "https://images.unsplash.com/photo-1667382137969-a11fd256717d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBJbmRpYW4lMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTcwNjQwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                  date: "Dec 28, 2024",
                  time: "2:30 PM"
                },
                {
                  quote: "The parser filled most fields for me; agents handled the outreach.",
                  author: "Rohit S.",
                  location: "Bengaluru",
                  role: "QA Engineer",
                  image: "https://images.unsplash.com/photo-1681165232934-c09dfa5ee694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBJbmRpYW4lMjBtYW4lMjBzb2Z0d2FyZSUyMGRldmVsb3BlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzA2NDA5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                  date: "Dec 27, 2024",
                  time: "11:15 AM"
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="group"
                >
                  <Card className="h-full bg-gray-900/80 border border-gray-200/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                    <CardContent className="p-8">
                      {/* Quote */}
                      <div className="mb-4">
                        <div className="flex items-start space-x-2 mb-4">
                          <div className="text-white text-lg sm:text-xl md:text-2xl lg:text-4xl leading-none">"</div>
                          <blockquote className="text-md md:text-md lg:text-lg text-white leading-relaxed font-medium italic">
                            {testimonial.quote}
                          </blockquote>
                          <div className="text-white text-4xl leading-none self-end">"</div>
                        </div>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-blue-200">
                              <span className="text-white font-bold text-lg">
                                {testimonial.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <div className="font-bold text-white">{testimonial.author}</div>
                            <div className="text-sm text-white/90">{testimonial.role}</div>
                            <div className="text-sm text-white/80 font-medium">{testimonial.location}</div>
                          </div>
                        </div>

                        {/* Verification Badge */}
                        <div className="text-right">
                          <div className="flex items-center justify-end mt-1">
                            <CheckCircle2 className="w-3 h-3 text-green-300 mr-1" />
                            <span className="text-xs text-green-500">Verified</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div
              className="text-center mt-10"
            >
              <div className="bg-gray-900/80 rounded-3xl p-10 border border-blue-200/50 shadow-lg backdrop-blur-sm max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg md:text-xl lg:text-2xl font-bold text-white">Join the success stories</span>
                  </div>

                  <p className="text-xs sm:text-sm md:text-md lg:text-lg text-white max-w-2xl mx-auto leading-relaxed">
                    Be the next professional to land your dream job. It takes just 2 minutes to get started.
                  </p>

                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-sm md:text-md lg:text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                    onClick={()=>navigate('/signup/candidate')}
                  >
                    Upload Your CV Now
                    <Upload className="w-5 h-5 ml-2" />
                  </Button>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-white">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-green-500" />
                      Free Forever
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      2-minute setup
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-purple-500" />
                      No spam, guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* In-Depth Benefits - Why Join Now */}
      <section id="benefits" ref={deepBenefitsRef} className="relative min-h-screen flex flex-col items-center py-10 bg-gray-50/50"
        style={{
          backgroundImage: `url(${deepbenefitsbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
        <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
                <span className="text-white bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="text-white/90">Job Search Today</span>
              </h2>
              
              <p className="text-sm sm:text-md md:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Join thousands of professionals who've already discovered a smarter way to find their dream job
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-6 p-4 bg-gray-900/50 rounded-3xl border border-gray-200/50 hover:border-blue-200/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 bg-${benefit.color}-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl md:text-xl lg:text-2xl font-bold text-white/80 group-hover:text-white transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-sm md:text-md lg:text-lg text-white/80 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" ref={faqRef} className="relative min-h-screen flex flex-col items-center bg-gradient-to-br pt-10 from-blue-50/50 via-purple-50/30 to-blue-50/50"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
        <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
                <span className="text-white bg-clip-text text-transparent">
                  Your Questions
                </span>
                <br />
                <span className="text-white/90">
                  Answered
                </span>
              </h2>
              
              <p className="text-sm sm:text-md lg:text-xl md:text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
                Everything you need to know about getting started and making the most of your career opportunities
              </p>
            </div>

            {/* FAQ Grid */}
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden mb-2">
                  <AccordionTrigger className="px-6 py-2 text-left hover:no-underline group-hover:text-white transition-colors duration-300">
                    <div className="flex items-start space-x-4 w-full items-center">
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-white/80 text-sm sm:text-sm md:text-md lg:text-lg group-hover:text-white transition-colors duration-300">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-10">
                      <p className="text-white/80 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Contact Information */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
                <a 
                  href="mailto:info@v-accel.ai" 
                  className="group inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-200/50 hover:border-blue-300 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Email Support</div>
                    <div className="text-blue-600 text-xs">info@v-accel.ai</div>
                  </div>
                </a>

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
                </button>
              </div>

              {/* Enhanced Consent Microcopy */}
              <div
                className="text-center"
              >
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30 max-w-3xl mx-auto">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">Privacy Promise</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    By creating a profile you consent to our <span className="text-blue-600 font-medium hover:underline cursor-pointer">Terms</span> and <span className="text-blue-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>. 
                    <br className="hidden sm:block" />
                    <span className="font-semibold text-gray-800">We will never share your contact info without explicit consent.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-black to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="sm:text-3xl text-2xl md:text-4xl lg:text-6xl font-bold mb-4">
              Ready to get discovered by top companies?
            </h2>
            <p className="text-sm sm:text-md md:text-lg lg:text-xl mb-8 opacity-90">
              Join 1,200+ candidates who trust HireAccel to find them opportunities
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
              onClick={()=>navigate('/signup/candidate')}
            >
              Create Your Profile Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}