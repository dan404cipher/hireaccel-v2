import { 
  Clock, 
  Shield, 
  CheckCircle2, 
  Upload,
  Target,
  Bell,
  BarChart3,
  ChevronLeft,
  ArrowRight,
  Play,
  Star,
  Users,
  FileText,
  Eye,
  MessageSquare,
  Award,
  Building2,
  Search,
  Calendar,
  Download,
  Mail,
  Phone,
  ExternalLink,
  Plus,
  Minus,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/landingpage/Footer";
import { Card } from "@/components/ui/card";
import { CardContent } from "../ui/card";
import { Header } from "../Header";
import { useNavigate } from "react-router-dom";

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
    text: "Get discovered by hiring teams — without applying multiple times."
  },
  {
    icon: Upload,
    text: "Resume parsing saves you time — fill profile automatically."
  },
  {
    icon: Shield,
    text: "You control visibility — we only share if you consent to submissions."
  }
];

const howItWorksSteps = [
  {
    step: 1,
    title: "Upload CV or create profile",
    description: "Takes just 2 minutes to get started.",
    icon: Upload
  },
  {
    step: 2,
    title: "Our agents review, validate & tag skills",
    description: "Expert recruiters analyze and categorize your profile.",
    icon: CheckCircle2
  },
  {
    step: 3,
    title: "Agents submit matching profiles to hiring teams",
    description: "Within 48 hours, we match you with relevant opportunities.",
    icon: Target
  },
  {
    step: 4,
    title: "Get interview invites",
    description: "Decide which companies to talk to on your terms.",
    icon: Calendar
  }
];

const features = [
  {
    icon: FileText,
    title: "Resume parser + auto-fill",
    description: "Upload Word/PDF; we extract education, experience & skills so you don't type.",
    micro: "Fills most fields automatically — verify in one click."
  },
  {
    icon: BarChart3,
    title: "Profile progress bar",
    description: "Reach 80% and you become discoverable to agents.",
    micro: "Profiles at 80% get 3× more matches."
  },
  {
    icon: Award,
    title: "Skill tags & role signals",
    description: "Choose top 5 skills to appear in agent searches.",
    micro: "Pick the skills you want to be contacted for."
  },
  {
    icon: Eye,
    title: "Privacy & control",
    description: "Contact details hidden until you approve an introduction.",
    micro: "We never reveal your phone/email to companies without your OK."
  },
  {
    icon: Bell,
    title: "Match notifications",
    description: "SMS/WhatsApp + email alerts when you're submitted.",
    micro: "Immediate push notification when an agent submits your profile."
  },
  {
    icon: MessageSquare,
    title: "Interview prep nudges",
    description: "Quick tips for first call, document checklist, and calendar link suggestion.",
    micro: "Get a short message with interview tips when a company expresses interest."
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
    description: "Our agents work with hiring teams — we surface you where fits exist."
  },
  {
    icon: Clock,
    title: "Time-saver",
    description: "One profile = multiple opportunities. Spend 2 minutes now to get continuous exposure."
  },
  {
    icon: Shield,
    title: "Confidential",
    description: "You keep control; we only share after you approve."
  },
  {
    icon: CheckCircle2,
    title: "Interview-ready",
    description: "Agents include context & short notes with each submission so recruiters see a quick fit summary."
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

export function JobCandidates({ onBackToHome }: JobCandidatesProps) {
  const navigate = useNavigate();
  const [heroRef, heroInView] = useInView();
  const [benefitsRef, benefitsInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [testimonialsRef, testimonialsInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [proofRef, proofInView] = useInView();
  const [deepBenefitsRef, deepBenefitsInView] = useInView();
  const [exampleRef, exampleInView] = useInView();
  const [faqRef, faqInView] = useInView();

  const [profileProgress, setProfileProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setProfileProgress(80), 1000);
    return () => clearTimeout(timer);
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
      <section ref={heroRef} className="relative py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content - 7 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              {/* Success Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200/50"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-700 font-semibold text-sm">1,200+ candidates already matched this month</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Skip the job hunt.
                </span>
                <br />
                <span className="text-gray-900">
                  Let opportunities find you.
                </span>
              </h1>
              
              <div className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                <p className="mb-4">
                  <strong className="text-gray-800">Upload once. Get matched forever.</strong>
                </p>
                <p>
                  Our expert agents work 24/7 to match your profile with hiring teams. 
                  You'll receive <span className="text-blue-600 font-semibold">interview invites directly</span> — no more applications, no more waiting.
                </p>
              </div>

              {/* Success Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-wrap items-center gap-6 mb-8"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">73% get interviews in 48 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">2-minute setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">100% confidential</span>
                </div>
              </motion.div>
              
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
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Your info stays private until you approve</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>Free forever</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Content - 5 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Background Image */}
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1650784855038-9f4d5ed154a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwcHJvZmVzc2lvbmFscyUyMHdvcmtpbmclMjB0b2dldGhlciUyMHN1Y2Nlc3N8ZW58MXx8fHwxNzU2OTk2Nzc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Diverse professionals working together representing career success"
                  className="w-full h-80 object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent rounded-3xl"></div>
                
                {/* Floating Success Cards */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={heroInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Interview Scheduled!</p>
                      <p className="text-xs text-gray-600">Software Engineer at TechCorp</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={heroInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">3 New Matches</p>
                      <p className="text-xs text-gray-600">Companies interested in you</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Dashboard Mockup */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Your Profile</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profile strength:</span>
                    <span className="font-semibold text-blue-600">{profileProgress}%</span>
                  </div>
                  <Progress value={profileProgress} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-xs text-gray-600">Companies viewing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">3</div>
                      <div className="text-xs text-gray-600">Interview requests</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Animated Activity Feed */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Live agent activity</span>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your profile submitted to senior developer role at FinTech startup
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>

      </section>

      {/* 2. Quick Benefits Strip */}
      <section ref={benefitsRef} className="relative py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-center space-x-3"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-700 font-medium">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 font-medium">No fees. No hassle. Just one profile.</p>
          </motion.div>
        </div>
      </section>

      {/* 3. How Matching Works - Enhanced Theme Integration */}
      <section id="how-it-works" ref={stepsRef} className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Enhanced Background Design */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-pink-100/80 rounded-full border border-blue-200/50 backdrop-blur-sm">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered Matching Process</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              How Matching<br />Works
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Simple 4-step process powered by AI to get you directly connected with hiring teams looking for your exact skills and experience.
            </p>
          </motion.div>

          {/* Enhanced Process Flow */}
          <div className="relative">
            {/* Connecting Flow Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 transform -translate-y-1/2 z-0 rounded-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="relative group"
                >
                  {/* Mobile Flow Connector */}
                  <div className="md:hidden flex justify-center mb-6">
                    {index > 0 && (
                      <div className="w-1 h-8 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full"></div>
                    )}
                  </div>

                  {/* Enhanced Card */}
                  <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 border-2 border-white/50 shadow-xl hover:shadow-2xl transition-shadow duration-200 backdrop-blur-sm overflow-hidden h-full">
                    {/* Step Number Badge - Enhanced */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white z-10">
                      <span className="text-xl font-bold text-white">
                        {step.step}
                      </span>
                    </div>

                    {/* Icon Container - Enhanced */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                          <step.icon className="w-10 h-10 text-white" />
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-xl"></div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {step.description}
                      </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
                    <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-lg"></div>
                  </div>

                  {/* Desktop Flow Connector - Enhanced */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-200">
                        <ArrowRight className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Bottom Text & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-center mt-20"
          >
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm max-w-4xl mx-auto">
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We log every submission with agent notes and timestamps — your activity stays private until you approve any introduction. 
                <span className="font-semibold text-blue-600"> Complete transparency, total control.</span>
              </p>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg shadow-xl"
                onClick={()=>navigate('/signup/candidate')}
              >
                Experience the Magic
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Features Designed for Job Seekers */}
      <section id="features" ref={featuresRef} className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200/50 px-6 py-3 mb-8">
              <Award className="w-5 h-5 mr-2" />
              Features Designed for Job Seekers
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              <span className="text-gray-900">to Get Hired</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Built specifically for job seekers who want complete control over their career opportunities
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features && features.length > 0 ? features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-white to-purple-50/30 border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                  <CardContent className="p-8">
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {/* Micro Detail */}
                      <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50">
                        <p className="text-sm text-purple-700 font-medium">
                          {feature.micro}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">Loading features...</div>
              </div>
            )}
          </div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-3xl p-8 border border-purple-200/50 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">300+</div>
                <div className="text-gray-600">Ready-to-Join Candidates</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-pink-600">48hrs</div>
                <div className="text-gray-600">Average Response Time</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">73%</div>
                <div className="text-gray-600">Get Interviews Within 2 Days</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
              {/* 4. Proof & Testimonials Section */}
        <section id="testimonials" ref={testimonialsRef} className="relative py-24 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-200/50 px-6 py-3 mb-8">
              <Star className="w-5 h-5 mr-2" />
              Trusted by Professionals
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real Results from
              </span>
              <br />
              <span className="text-gray-900">Real Candidates</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join professionals who've already transformed their job search with our platform
            </p>
          </motion.div>

          {/* Trust Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-blue-50/80 via-purple-50/50 to-blue-50/80 rounded-3xl p-8 border border-blue-200/30 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    300+
                  </div>
                  <div className="text-gray-600 font-medium">Candidates in pool</div>
                  <div className="text-sm text-gray-500">Ready to join immediately</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    1,200+
                  </div>
                  <div className="text-gray-600 font-medium">Matches sent this month</div>
                  <div className="text-sm text-gray-500">Direct to hiring teams</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    48hrs
                  </div>
                  <div className="text-gray-600 font-medium">Avg time to first submission</div>
                  <div className="text-sm text-gray-500">Industry-leading speed</div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Company Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-16"
          >
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-8 font-medium">
                Profiles viewed by hiring teams at leading companies
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
                <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <span className="font-semibold text-gray-700">TechCorp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-8 h-8 text-purple-600" />
                    <span className="font-semibold text-gray-700">InnovateLabs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-8 h-8 text-green-600" />
                    <span className="font-semibold text-gray-700">StartupVentures</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-8 h-8 text-orange-600" />
                    <span className="font-semibold text-gray-700">GrowthTech</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Representative companies in our network</p>
              </div>
            </div>
          </motion.div>

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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-white to-blue-50/30 border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                  <CardContent className="p-8">
                    {/* Quote */}
                    <div className="mb-6">
                      <div className="flex items-start space-x-2 mb-4">
                        <div className="text-blue-500 text-4xl leading-none">"</div>
                        <blockquote className="text-lg text-gray-700 leading-relaxed font-medium italic">
                          {testimonial.quote}
                        </blockquote>
                        <div className="text-blue-500 text-4xl leading-none self-end">"</div>
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
                          <div className="font-bold text-gray-800">{testimonial.author}</div>
                          <div className="text-sm text-gray-600">{testimonial.role}</div>
                          <div className="text-sm text-blue-600 font-medium">{testimonial.location}</div>
                        </div>
                      </div>

                      {/* Verification Badge */}
                      <div className="text-right">
                        <div className="flex items-center justify-end mt-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">Verified</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-3xl p-10 border border-blue-200/50 shadow-lg backdrop-blur-sm max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">Join the success stories</span>
                </div>
                
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Be the next professional to land your dream job. It takes just 2 minutes to get started.
                </p>
                
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={()=>navigate('/signup/candidate')}
                >
                  Upload Your CV Now
                  <Upload className="w-5 h-5 ml-2" />
                </Button>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-gray-600">
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
          </motion.div>
        </div>
      </section>


      {/* In-Depth Benefits - Why Join Now */}
      <section id="benefits" ref={deepBenefitsRef} className="relative py-24 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={deepBenefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-200/50 px-6 py-3 mb-8">
              <Star className="w-5 h-5 mr-2" />
              Why Join Now
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-gray-900">Job Search Today</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who've already discovered a smarter way to find their dream job
            </p>
          </motion.div>

          {/* Benefits List */}
          <div className="space-y-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={deepBenefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15 + 0.3, duration: 0.6 }}
                className="flex items-start space-x-6 p-8 bg-gradient-to-r from-white to-blue-50/30 rounded-3xl border border-gray-200/50 hover:border-blue-200/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={deepBenefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-10 border border-gray-200/50 shadow-xl">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">Ready to get started?</span>
                </div>
                
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Join 1,200+ professionals who found their perfect role this month. Setup takes just 2 minutes.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Upload Your CV Now
                    <Upload className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    2-minute setup • No credit card required
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    100% Private & Secure
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    Free Forever
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    1,200+ Success Stories
                  </div>
                </div>
              </div>
            </div>
          </motion.div> */}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get discovered by top companies?
            </h2>
            <p className="text-xl mb-8 opacity-90">
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
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer & Legal */}
      <footer className="relative bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50 border-t border-blue-200/30 overflow-hidden">
        {/* Footer Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-blue-400/5 to-cyan-400/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-2xl"></div>
        </div>
        
       
      </footer>
      {/* FAQ Section */}
      <section id="faq" ref={faqRef} className="relative py-24 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-20"
          >
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 px-6 py-3 mb-8">
              <MessageSquare className="w-5 h-5 mr-2" />
              Top Candidate Questions
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Questions
              </span>
              <br />
              <span className="text-gray-900">
                Answered
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Everything you need to know about getting started and making the most of your career opportunities
            </p>
          </motion.div>

          {/* FAQ Grid */}
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={faqInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`item-${index}`} className="border-none">
                      <AccordionTrigger className="text-left hover:no-underline px-8 py-6 group-hover:text-blue-600 transition-colors duration-300">
                        <div className="flex items-start space-x-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-bold text-gray-800 text-xl group-hover:text-blue-600 transition-colors duration-300">
                              {faq.question}
                            </h3>
                          </div>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-8 pb-8">
                        <div className="ml-16">
                          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl p-6 border border-blue-100/50">
                            <p className="text-gray-700 leading-relaxed text-lg">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-center mt-20"
          >
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-10 border border-gray-200/50 shadow-xl backdrop-blur-sm max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">Ready to Transform Your Career?</span>
                </div>
                
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of professionals who've already discovered their dream jobs through our platform. Setup takes just 2 minutes.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Upload Your CV Now
                    <Upload className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    100% Free • No Credit Card Required
                  </div>
                </div>

                {/* Trust Indicators */}
                {/* <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    2-minute setup
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    Free forever
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    1,200+ matched this month
                  </div>
                </div>
              </div>
            </div> */}
          {/* </motion.div> 
          
          */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Enhanced Navigation Links */}
          {/* <div className="flex flex-wrap justify-center items-center gap-2 text-sm mb-10">
            {[
              { label: "About", href: "#" },
              { label: "How it works", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" }
            ].map((link, index) => (
              <div key={index}>
                <button className="hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-white/50 backdrop-blur-sm font-medium text-gray-700">
                  {link.label}
                </button>
                {index < 3 && <span className="text-blue-300 mx-2">•</span>}
              </div>
            ))}
          </div> */}

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
            
            <button className="group inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200/50 hover:border-green-300 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
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
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
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
          </motion.div>
        </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}