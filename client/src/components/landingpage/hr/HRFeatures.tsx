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
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../Header";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Enhanced Background with Perspective Grid */}
      <div className="absolute inset-0">
        {/* Perspective Grid */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(59, 130, 246, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(59, 130, 246, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'perspective(1000px) rotateX(60deg)',
              transformOrigin: 'center top',
            }}
          />
        </div>

        {/* Diagonal Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgb(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(-45deg, rgb(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-25">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgb(59, 130, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
              backgroundPosition: '0 0, 40px 40px',
            }}
          />
        </div>

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 border border-blue-200/40 rounded-lg rotate-12"
          animate={{
            rotate: [12, 25, 12],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        <motion.div
          className="absolute top-40 right-20 w-24 h-24 border border-purple-200/40 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-lg rotate-45"
          animate={{
            rotate: [45, 60, 45],
            x: [0, 20, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />

        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [360, 180, 0],
            x: [0, -50, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 30, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, -180, -360],
            x: [0, 60, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 35, repeat: Infinity }}
        />

        {/* Subtle Lines */}
        <motion.div
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-200/30 to-transparent"
          animate={{
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-200/30 to-transparent"
          animate={{
            opacity: [0.7, 0.3, 0.7]
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-100/20 to-transparent rounded-br-full" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-cyan-100/20 to-transparent rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-gradient-to-tl from-pink-100/20 to-transparent rounded-tl-full" />
      </div>

      <Header />

      {/* 1. Hero Section */}
      <section ref={heroRef} className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Post a job — receive vetted candidates in 48 hours.
                </span>
              </h1>

              <h2 className="text-xl text-gray-600 mb-8 leading-relaxed">
                <strong>HireAccel by V-Accel</strong> — Our expert recruitment agents personally source, screen, and submit only the most qualified candidates to your private dashboard. Full confidentiality guaranteed until you approve contact.
              </h2>

              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl w-full sm:w-auto"
                >
                  Post Your First Job (Free)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg w-full sm:w-auto"
                >
                  Book 15-Min Demo
                  <Play className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                <Star className="w-4 h-4 inline mr-1" />
                White-glove onboarding available for first 50 partners.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Professional team meeting image */}
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1709803857154-d20ee16ff763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nJTIwY29uZmVyZW5jZSUyMHJvb218ZW58MXx8fHwxNzU2OTk1NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Professional business team meeting in modern conference room"
                  className="w-full h-64 object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Agent Dashboard</h3>
                  <Badge className="bg-green-100 text-green-700">Live</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Matches sent:</span>
                    <span className="font-semibold text-blue-600">3 / 48 hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Score:</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Enhanced Problem Section */}
      <section ref={problemRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={problemInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <Badge className="bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-red-200/50 px-4 py-2 mb-6">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Current Hiring Challenges
                </Badge>
              </motion.div>

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
          </motion.div>

          {/* Problem Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={problemInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center mb-16"
          >
            <div className="relative max-w-md">
              <img
                src="https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc1Njk5NTQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern office workspace showing recruitment challenges"
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent rounded-xl"></div>
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-medium text-sm">Traditional hiring methods are outdated</p>
              </div>
            </div>
          </motion.div>

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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={problemInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full bg-white/90 backdrop-blur-sm border border-red-100/50 hover:border-red-200 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
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

                    <div className="mt-6 flex justify-center">
                      <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Impact Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 md:p-12"
          >
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                The Hidden Cost of Inefficient Hiring
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every day of delay in hiring costs your business productivity, revenue, and competitive advantage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  stat: "40+ days",
                  label: "Average time to hire",
                  icon: Calendar,
                  detail: "Industry standard hiring cycle"
                },
                {
                  stat: "$15,000+",
                  label: "Cost per hire",
                  icon: TrendingUp,
                  detail: "Including time and resources"
                },
                {
                  stat: "73%",
                  label: "Of top talent lost",
                  icon: Users,
                  detail: "Due to slow hiring processes"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={problemInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                  className="text-center group hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-red-500 group-hover:to-orange-500 transition-all duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-red-600 mb-2">{stat.stat}</div>
                  <div className="font-semibold text-gray-800 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.detail}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solution Transition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center mt-16"
          >
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      There's a better way
                    </span>
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    When you need speed, quality, and complete confidentiality — HireAccel transforms how you hire.
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Solution / Value Proposition */}
      <section ref={solutionRef} className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={solutionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                What you get with HireAccel
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={solutionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="text-center h-full bg-white/80 backdrop-blur-sm border border-blue-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <prop.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{prop.title}</h3>
                    <p className="text-gray-600 text-sm">{prop.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section ref={howItWorksRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                How it works
              </span>
            </h2>
            <p className="text-gray-600 mb-8">
              Complete transparency: every submission tracked with timestamps, agent notes, and verified candidate consent.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting Line Background */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 opacity-30"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="text-center relative z-10"
                >
                  <div className="relative">
                    {/* Step Circle */}
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg relative z-20"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {step.step}
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-50 -z-10"></div>
                    </motion.div>

                    {/* Active connecting line segment */}
                    {index < howItWorksSteps.length - 1 && (
                      <motion.div
                        className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full z-10"
                        style={{
                          left: '50%',
                          width: 'calc(100% + 2rem)',
                          transform: 'translateX(0%)'
                        }}
                        initial={{ scaleX: 0 }}
                        animate={howItWorksInView ? { scaleX: 1 } : {}}
                        transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={howItWorksInView ? { opacity: 1 } : {}}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.6 }}
                  >
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </motion.div>

                  {/* Step indicator dots */}
                  <motion.div
                    className="flex justify-center mt-4 space-x-1"
                    initial={{ opacity: 0 }}
                    animate={howItWorksInView ? { opacity: 1 } : {}}
                    transition={{ delay: index * 0.2 + 0.6, duration: 0.6 }}
                  >
                    {[...Array(3)].map((_, dotIndex) => (
                      <div
                        key={dotIndex}
                        className="w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        style={{
                          animationDelay: `${index * 0.2 + dotIndex * 0.1}s`,
                          animation: 'pulse 2s infinite'
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Progress indicators */}
            <motion.div
              className="flex justify-center mt-8 space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {howItWorksSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={howItWorksInView ? { scale: 1 } : {}}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Features Grid */}
      <section ref={featuresRef} className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Features & Trust
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs text-blue-600">
                      {feature.micro}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Social Proof & Counters */}
      <section ref={socialProofRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={socialProofInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {/* Trust Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">300+</div>
                <p className="text-gray-600">Candidates in pool</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">48hrs</div>
                <p className="text-gray-600">Avg time to first submission</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
                <p className="text-gray-600">Match quality score</p>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                  animate={socialProofInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-semibold text-gray-800">{testimonial.author}</p>
                        <p className="text-sm text-gray-600">{testimonial.title}, {testimonial.company}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. Demo / Quick Post Form */}
      <section ref={demoFormRef} className="relative py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={demoFormInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Post Your First Job
                  </span>
                </CardTitle>
                <CardDescription className="text-lg">
                  Quick 2-minute setup — our expert agents take care of everything else
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Title *</label>
                    <Input
                      placeholder="e.g. Senior Full Stack Developer"
                      className="bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Location *</label>
                    <Select>
                      <SelectTrigger className="bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select work location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-0 shadow-lg">
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Required Skills & Technologies *</label>
                  <Input
                    placeholder="e.g. React, Node.js, TypeScript, AWS"
                    className="bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level & Special Requirements</label>
                  <Textarea
                    placeholder="e.g. 3-5 years experience, team leadership skills, startup experience preferred..."
                    className="bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1">
                    Submit Job & Start Matching
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Book Strategy Call
                    <Calendar className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 8. Case Study/Success Story */}
      <section ref={caseStudyRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={caseStudyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Success Stories
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">TechScale Ventures</h3>
                        <p className="text-gray-600">Series B Startup</p>
                      </div>
                    </div>
                    <blockquote className="text-gray-700 text-lg italic mb-6">
                      "We needed to scale our engineering team from 8 to 25 developers in 3 months. HireAccel delivered 31 pre-vetted candidates across 7 roles. We hired 18 of them."
                    </blockquote>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">31</div>
                        <div className="text-sm text-gray-600">Candidates</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">18</div>
                        <div className="text-sm text-gray-600">Hired</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">58%</div>
                        <div className="text-sm text-gray-600">Hit Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Confidential Executive Search</h4>
                    <p className="text-gray-600">Built entire C-suite team without public job postings or information leaks.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rapid Team Scaling</h4>
                    <p className="text-gray-600">From job posting to first interview in under 48 hours for urgent roles.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Quality Over Quantity</h4>
                    <p className="text-gray-600">Every candidate submission personally vetted by senior recruitment specialists.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. Pricing / CTA */}
      <section ref={pricingRef} className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Simple. Free. Forever.
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              HireAccel is completely free for early partners. No hidden fees, no subscriptions, no catch.
            </p>

            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200 backdrop-blur-sm mb-8">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Unlimited Job Posts</h3>
                    <p className="text-gray-600">Post as many roles as you need. No limits, no restrictions.</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Expert Agent Support</h3>
                    <p className="text-gray-600">Dedicated recruitment specialists handle every submission.</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Full Dashboard Access</h3>
                    <p className="text-gray-600">Complete analytics, tracking, and candidate management tools.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                  >
                    Start Hiring Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
                  >
                    Book Consultation
                    <Calendar className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-gray-500">
              💙 Free forever for early partners who join during our beta phase.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section ref={faqRef} className="relative py-20 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={faqInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <AccordionItem value={`item-${index}`} className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="relative border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="font-bold text-xl mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HireAccel
                </span>
              </h3>
              <p className="text-gray-600 mb-4">
                AI-powered recruitment platform connecting HR professionals with pre-vetted candidates.
                Completely free for early partners.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>📍 Perungudi, Chennai, India</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">How It Works</a></li>
                <li><a href="#" className="hover:text-blue-600">Success Stories</a></li>
                <li><a href="#" className="hover:text-blue-600">FAQ</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  hello@hireaccel.com
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +91 (555) 123-4567
                </li>
                <li className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Live Chat Support
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200/50 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 HireAccel by V-Accel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}