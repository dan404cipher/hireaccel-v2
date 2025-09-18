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
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// Removed framer-motion for better performance
import { useEffect, useRef, useState } from "react";
import { CompetitorComparison } from "@/components/landingpage/hr/CompetitorComparison";
import { Footer } from "@/components/landingpage/Footer";
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

const problemPoints = [
  "Screening hundreds of resumes takes weeks of valuable time.",
  "Public job postings attract countless unqualified applications.", 
  "Confidential hiring searches risk candidate and role exposure."
];

const valueProps = [
  {
    icon: Clock,
    title: "Lightning Fast",
    description: "Qualified candidates delivered within 48 hours by our expert agents."
  },
  {
    icon: Shield,
    title: "Pre-Vetted", 
    description: "Every profile is manually reviewed, validated, and skillset-verified by our team."
  },
  {
    icon: CheckCircle2,
    title: "Fully Confidential",
    description: "Complete privacy protection — candidates only learn details you approve."
  },
  {
    icon: HandHeart,
    title: "Zero Hassle",
    description: "Post once and relax — we handle sourcing, screening, and shortlisting."
  },
  {
    icon: BarChart3,
    title: "Transparent Tracking",
    description: "Real-time dashboard with detailed submission metrics and feedback loops."
  }
];

const howItWorksSteps = [
  {
    step: 1,
    title: "Post Your Job",
    description: "Complete our 2-minute form with role details, skills, and requirements."
  },
  {
    step: 2, 
    title: "Our Agents Work",
    description: "Expert recruiters search, filter, and shortlist the best-fit candidates."
  },
  {
    step: 3,
    title: "Review Quality Matches", 
    description: "Receive organized candidate profiles with detailed notes in your dashboard."
  },
  {
    step: 4,
    title: "Interview & Hire",
    description: "Select candidates to interview — we facilitate secure introductions."
  }
];

const features = [
  {
    icon: HandHeart,
    title: "White-Glove Job Setup",
    description: "Our experts help craft job descriptions and set precise targeting filters.",
    micro: "Perfect for urgent or highly confidential roles."
  },
  {
    icon: Clock,
    title: "48-Hour Delivery Promise", 
    description: "First qualified candidate submissions guaranteed within two business days.",
    micro: "Binding SLA commitment for all partners."
  },
  {
    icon: Shield,
    title: "Private Candidate Pipeline",
    description: "Your hiring team only sees pre-approved, agent-curated profiles.",
    micro: "Complete control over your recruitment channel."
  },
  {
    icon: Target,
    title: "AI-Enhanced Matching",
    description: "Smart algorithms plus human expertise identify top-tier talent faster.",
    micro: "Higher quality, shorter shortlists."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description: "Track submission timelines, candidate status, and hiring funnel metrics.",
    micro: "Data-driven recruitment optimization."
  },
  {
    icon: Download,
    title: "Seamless ATS Integration",
    description: "One-click export to CSV or direct integration with major ATS platforms.",
    micro: "Zero disruption to existing workflows."
  }
];

const testimonials = [
  {
    quote: "HireAccel delivered 12 perfectly-matched candidates in 48 hours for our critical project roles. What would have taken our team 3-4 weeks was done in 2 days with better quality results.",
    author: "Priya Krishnamurthy",
    title: "Head of Talent Acquisition",
    company: "InnovateTech Solutions"
  },
  {
    quote: "Finally, a recruitment partner that understands confidentiality. They helped us build a senior team for our stealth product launch without any information leaks. Exceptional discretion and speed.",
    author: "Rajesh Menon", 
    title: "VP of Human Resources",
    company: "GrowthScale Ventures"
  }
];

const faqs = [
  {
    question: "How do you ensure candidate quality and relevance?",
    answer: "Our expert recruitment agents manually review every profile, conduct skill verification through portfolio and experience assessment, and apply your specific criteria before submission. Each candidate goes through our multi-stage vetting process, and we maintain detailed quality metrics to continuously improve our matching accuracy."
  },
  {
    question: "What if I'm not satisfied with the candidate submissions?",
    answer: "We guarantee your satisfaction with unlimited revisions and re-sourcing at no extra cost. Our white-glove onboarding ensures we understand your exact requirements from day one, and we'll keep refining until we deliver candidates who meet your standards."
  },
  {
    question: "How do you maintain complete confidentiality for sensitive roles?",
    answer: "We use a secure, compartmentalized approach where candidates never see your company name, internal details, or sensitive information without your explicit approval. All communications are handled through our encrypted platform, protecting both your organizational privacy and strategic hiring plans."
  },
  {
    question: "Can HireAccel integrate with our existing recruitment workflow?",
    answer: "Absolutely. We support seamless CSV exports and direct API integrations with major ATS platforms like Workday, BambooHR, and Greenhouse. Our technical team provides white-glove setup to ensure zero disruption to your current hiring processes."
  },
  {
    question: "What happens when the free beta period ends?",
    answer: "HireAccel will remain completely free for all early partners who join during our beta phase. We'll provide 60+ days advance notice before introducing any pricing for new customers, and early partners will receive grandfathered pricing benefits."
  }
];

export function HRProfessionals() {
  const navigate=useNavigate();
  const [heroRef, heroInView] = useInView();
  const [problemRef, problemInView] = useInView();
  const [solutionRef, solutionInView] = useInView();
  const [howItWorksRef, howItWorksInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [socialProofRef, socialProofInView] = useInView();
  const [demoFormRef, demoFormInView] = useInView();
  const [caseStudyRef, caseStudyInView] = useInView();
  const [pricingRef, pricingInView] = useInView();
  const [faqRef, faqInView] = useInView();

  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0">
        {/* Simple Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Static Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-blue-200/20 rounded-lg rotate-12 opacity-30" />
        <div className="absolute top-40 right-20 w-24 h-24 border border-purple-200/20 rounded-full opacity-25" />
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-blue-100/15 to-purple-100/15 rounded-lg rotate-45 opacity-20" />

        {/* Static Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-green-400/6 to-blue-400/6 rounded-full blur-3xl" />

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-100/10 to-transparent rounded-br-full" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-cyan-100/10 to-transparent rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-gradient-to-tl from-pink-100/10 to-transparent rounded-tl-full" />
      </div>

      {/* Header with Navigation */}
      <Header 
        navItems={[
          { label: "How It Works", id: "how-it-works" },
          { label: "Features", id: "features" },
          { label: "Testimonials", id: "testimonials" },
          { label: "FAQ", id: "faq" },
          { label: "Compare", id: "competitor-comparison" }
        ]}
        showAuthButtons={true}
      />

      {/* 1. Hero Section */}
      <section ref={heroRef} className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <divdiv
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              {/* AI Platform Badge */}
              <div className="mb-6">
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  AI-Powered Recruitment Platform
                </Badge>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Post a job - receive<br />
                  vetted candidates<br />
                </span>
                <span className="text-gray-900">
                  in 48 Hours
                </span>
              </h1>
              
              {/* Subtitle */}
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-4">
                <strong>HireAccel by V-Accel</strong> —  Our expert recruitment agents personally source, screen, and deliver <span className="text-blue-600 font-semibold">only qualified candidates</span> to your private dashboard with <span className="text-purple-600 font-semibold">complete confidentiality </span> guaranteed until you approve contact.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Shield, title: "No Hidden Costs", desc: "What you see is what you get - forever free" },
                { icon: Users, title: "No User Limits", desc: "Add unlimited team members at no extra cost" },
                { icon: Zap, title: "Full Features", desc: "Access to all premium features included" }
              ].map((benefit, index) => (
                <divdiv
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <benefit.icon className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                  <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-sm text-gray-600 text-wrap text-center">{benefit.desc}</p>
                </divdiv>
              ))}
            </div>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">48-Hour Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Pre-Vetted Only</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <HandHeart className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Zero Hassle</span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl w-full sm:w-auto"
                  onClick={()=>navigate('/signup/hr')}
                >
                  Post unlimited jobs for FREE
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg w-full sm:w-auto"
                  onClick={()=>navigate('/signup/hr')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch 2-Min Demo
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">Trusted by 50+ HR teams</span>
                </div>
              </div>
            </divdiv>

            {/* Right Dashboard */}
            <divdiv
              initial={{ opacity: 0, x: 20 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative"
            >
              {/* Dashboard Container */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-gray-800">Live Recruitment Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                      <Zap className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">Candidates Submitted</div>
                      <div className="text-xs text-gray-500">4 of 5 48hrs</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-purple-600">96%</div>
                      <div className="text-sm text-gray-600">Quality Match Score</div>
                      <div className="text-xs text-gray-500">Above average</div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Screening Progress</span>
                      <span className="text-xs text-blue-600">8/10 Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>

                  {/* Interview Ready */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Interview Ready</span>
                      <span className="text-xs text-green-600">5 Candidates</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button disabled className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 cursor-no-drop">
                    <Search className="w-4 h-4 mr-2" />
                    Review Matches
                  </Button>

                  {/* Additional Info */}
                  <div className="text-center py-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">36 hrs remaining</span>
                  </div>
                </div>
              </div>
            </divdiv>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section ref={problemRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <divdiv
            initial={{ opacity: 0, y: 20 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <div className="max-w-4xl mx-auto">
              {/* <Badge className="bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-red-200/50 px-4 py-2 mb-6">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Current Hiring Challenges
              </Badge> */}
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Traditional hiring is
                </span>
                <br />
                <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                  broken and costly
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                In today's competitive market, outdated recruitment methods waste time, money, and talent while compromising confidentiality.
              </p>
            </div>
          </divdiv>

          {/* Problem Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Clock,
                title: "Painfully Slow",
                problem: "Screening hundreds of resumes takes weeks of valuable time",
                detail: "Traditional hiring processes can take 3-6 months, causing you to lose top talent to faster competitors",
                color: "from-red-500 to-red-600"
              },
              {
                icon: TrendingUp,
                title: "Prohibitively Expensive", 
                problem: "Public job postings attract countless unqualified applications",
                detail: "Recruitment costs average $15,000+ per hire when factoring in time, resources, and opportunity costs",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Filter,
                title: "Compromised Privacy",
                problem: "Confidential hiring searches risk candidate and role exposure",
                detail: "Public job boards expose sensitive company information and strategic hiring plans to competitors",
                color: "from-red-600 to-orange-600"
              }
            ].map((item, index) => (
              <divdiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={problemInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group"
              >
                <Card className="h-full bg-white/90 backdrop-blur-sm border border-red-100/50 hover:border-red-200 transition-colors duration-200 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                      {item.title}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50/50 rounded-xl border border-red-100/50">
                        <p className="text-gray-700 font-medium text-center">
                          "{item.problem}"
                        </p>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed text-center">
                        {item.detail}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </divdiv>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="relative py-24 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <divdiv
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-20"
          >
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 px-6 py-3 mb-8">
              <Zap className="w-5 h-5 mr-2" />
              Simple 4-Step Process
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              From job posting to qualified candidates in 48 hours — here's exactly how our expert recruitment process delivers results
            </p>
          </divdiv>

          {/* Process Flow */}
          <div className="relative">
            {/* Desktop Flow Line */}
            <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-5xl">
              <div className="relative h-2">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 rounded-full opacity-30"></div>
                <divdiv
                  initial={{ width: "0%" }}
                  animate={howItWorksInView ? { width: "100%" } : {}}
                  transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full"
                />
              </div>
              
              {/* Flow Dots */}
              <div className="absolute inset-0 flex justify-between items-center px-8">
                {howItWorksSteps.map((_, index) => (
                  <divdiv
                    key={index}
                    initial={{ scale: 0 }}
                    animate={howItWorksInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="w-4 h-4 bg-white border-4 border-blue-500 rounded-full shadow-lg"
                  />
                ))}
              </div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {howItWorksSteps.map((step, index) => (
                <divdiv
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative group h-full"
                >
                  {/* Step Card */}
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-lg hover:shadow-2xl group-hover:scale-105 h-full flex flex-col">
                    {/* Step Number Circle */}
                    <div className="flex items-center justify-center mb-8 flex-shrink-0">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-6 transition-transform duration-300">
                          <span className="text-white font-bold text-2xl">{step.step}</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="text-center space-y-4 flex-grow flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed flex-grow flex items-center">
                        <span className="w-full">{step.description}</span>
                      </p>
                    </div>

                    {/* Hover Gradient Border */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </div>

                  {/* Mobile Flow Arrow */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-6 mb-2">
                      <ArrowRight className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                </divdiv>
              ))}
            </div>

            {/* Bottom CTA Section */}
            <divdiv
              initial={{ opacity: 0, y: 20 }}
              animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-20 text-center"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-gray-200/50 shadow-xl max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center space-x-3" onClick={()=>navigate('/signup/hr')}>
                    <Clock className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-800">Ready to get started?</span>
                  </div>
                  
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Join 50+ companies that have already streamlined their hiring with our 48-hour guarantee
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                      onClick={()=>navigate('/signup/hr')}
                    >
                      Start Your First Job Post
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Shield className="w-4 h-4 mr-2 text-green-500" />
                      No credit card required • 100% Free
                    </div>
                  </div>
                </div>
              </div>
            </divdiv>
          </div>
        </div>
      </section>

      {/* 4. Features */}
      <section id="features" ref={featuresRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <divdiv
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Premium Features for HR Teams
              </span>
            </h2>
          </divdiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <divdiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card className="h-full bg-white/90 backdrop-blur-sm border border-gray-200/50 hover:border-blue-200 transition-colors duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-center mb-4">
                      {feature.description}
                    </p>
                    
                    <p className="text-blue-600 text-sm text-center font-medium">
                      {feature.micro}
                    </p>
                  </CardContent>
                </Card>
              </divdiv>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section id="testimonials" ref={socialProofRef} className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <divdiv
            initial={{ opacity: 0, y: 20 }}
            animate={socialProofInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trusted by Leading Companies
              </span>
            </h2>
          </divdiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <divdiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={socialProofInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.4 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50">
                  <CardContent className="p-8">
                    <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">
                          {testimonial.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{testimonial.author}</div>
                        <div className="text-gray-600 text-sm">{testimonial.title}</div>
                        <div className="text-blue-600 text-sm font-medium">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </divdiv>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="faq" ref={faqRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <divdiv
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
          </divdiv>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <divdiv
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={faqInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <AccordionItem value={`item-${index}`} className="bg-white/50 backdrop-blur-sm rounded-lg mb-4 border border-gray-200/50">
                  <AccordionTrigger className="px-6 py-4 text-left font-semibold text-gray-800 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </divdiv>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Competitor Analysis Section */}
      <div id="competitor-comparison">
        <CompetitorComparison />
      </div>


      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <divdiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to revolutionize your hiring process?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join 50+ companies already using HireAccel and save over ₹3,60,000 per year
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
              onClick={()=>navigate('/signup/hr')}
            >
              Get Started Free - Save ₹3,60,000+
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </divdiv>
        </div>
      </section>

      {/* Contact Support Section */}
      <div className="flex flex-wrap justify-center items-center gap-6 my-10">
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
      {/* Footer */}
      <Footer />
    </div>
  );
}