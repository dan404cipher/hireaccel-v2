import { 
    DollarSign, 
    Building2, 
    UserCheck, 
    BarChart3, 
    Clock4, 
    GraduationCap, 
    Laptop,
    Activity,
    Users,
    RefreshCw,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Zap,
    Star,
  } from "lucide-react";
  import { Button } from "./ui/button";
  import { motion } from "framer-motion";
  import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
  
  const hrFeatures = [
    {
      icon: DollarSign,
      title: "Unlimited Free Job Postings",
      description: "Post unlimited jobs with zero cost, no hidden fees, forever free"
    },
    {
      icon: Building2,
      title: "Multi-Company Dashboard",
      description: "Manage multiple companies in one place - completely free"
    },
    {
      icon: UserCheck,
      title: "Specialist HR Agent",
      description: "Dedicated support for the right hire"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track every interview stage & feedback"
    },
    {
      icon:Laptop,
      title:'Complete IT Solutions',
      description:'All your IT requirements handled with professional expertise',
    },
    {
      icon: Clock4,
      title: "24/7 Support",
      description: "Always connected to our recruitment experts"
    },
    {
      icon: GraduationCap,
      title: "Hire & Train Model",
      description: "Request freshers or lateral hires to be trained in specific skills before joining"
    },
    {
      icon: Laptop,
      title: "Complete IT Solutions",
      description: "All your IT requirements handled with professional expertise"
    },
   
  ];
  
  const candidateFeatures = [
    {
      icon: Activity,
      title: "Personal Interview Dashboard",
      description: "Track L1, L2, HR rounds in real time"
    },
    {
      icon: Users,
      title: "Specialist Candidate Agent",
      description: "Get matched to the right company with proper feedback"
    },
    {
      icon: CheckCircle2,
      title: "Comprehensive Status Updates",
      description: "Always know where you stand"
    },
    {
      icon: RefreshCw,
      title: "Instant Re-Matching",
      description: "Not selected? Get connected to another opening immediately"
    },
    {
      icon: UserCheck,
      title: "Monitored Applications",
      description: "No missed opportunities"
    }
  ];
  
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
  
  export function Features() {
    const [sectionRef, sectionInView] = useInView();
    const navigate = useNavigate();
    const [hrHovered, setHrHovered] = useState(false);
    const [candidatesHovered, setCandidatesHovered] = useState(false);
  
    return (
      <section id="features" className="py-24 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
              x: [0, 50, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1.3, 1, 1.3],
              rotate: [360, 180, 0],
              x: [0, -50, 0]
            }}
            transition={{ duration: 30, repeat: Infinity }}
          />
        </div>
  
        <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 mb-6 bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-pink-100/80 rounded-full backdrop-blur-sm border border-gray-200/50"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Platform Features</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Built for Both Sides
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive solutions for HR professionals and job seekers, working in perfect harmony
            </p>
          </motion.div>
  
          {/* Dual Layout - Both Sections Visible */}
          <div className="relative">
            {/* Central Divider with Animation */}
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent z-10 hidden lg:block">
              <motion.div
                className="hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <motion.div
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
            </div>
  
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative">
              {/* HR Professionals Section - Left Side */}
              <motion.div
                className="relative h-full"
                initial={{ opacity: 0, x: -50 }}
                animate={sectionInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.8 }}
                onMouseEnter={() => setHrHovered(true)}
                onMouseLeave={() => setHrHovered(false)}
              >
                <div className={`relative bg-gradient-to-br ${hrHovered ? 'from-blue-50 to-blue-100/50' : 'from-white to-blue-50/30'} rounded-3xl p-8 border-2 ${hrHovered ? 'border-blue-200' : 'border-gray-200/50'} transition-all duration-500 transform ${hrHovered ? 'scale-105' : 'scale-100'} shadow-xl hover:shadow-2xl backdrop-blur-sm h-full flex flex-col`}>
                  {/* Header */}
                  <motion.div
                    className="flex items-center mb-8"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        HR Professionals
                      </h3>
                      <p className="text-blue-600/80 font-medium">Streamline Your Recruitment</p>
                    </div>
                  </motion.div>
  
                  {/* Hero Content */}
                  <div className="mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                      Manage unlimited job postings, track candidates in real-time, and leverage AI-powered matching - all completely free forever.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 shadow-xl"
                      >
                        Start Hiring Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
  
                  {/* Features Grid */}
                  <div className="space-y-4 flex-1">
                    {hrFeatures.slice(0, 5).map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        animate={sectionInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                        whileHover={{ x: 10, scale: 1.02 }}
                        className="group"
                      >
                        <div className="flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 shadow-sm hover:shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {feature.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {feature.description}
                            </p>
                          </div>
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                            whileHover={{ x: 3 }}
                          >
                            <ArrowRight className="w-4 h-4 text-blue-500" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
  
                  {/* View All Features */}
                  <motion.div 
                    className="mt-6 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center w-full py-2 rounded-lg hover:bg-blue-50/50 transition-all" onClick={()=>navigate("/hr-features")}>
                      <span>View All HR Features</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </motion.div>
  
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-xl" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-lg" />
                </div>
              </motion.div>
  
              {/* Job Candidates Section - Right Side */}
              <motion.div
                className="relative h-full"
                initial={{ opacity: 0, x: 50 }}
                animate={sectionInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.8 }}
                onMouseEnter={() => setCandidatesHovered(true)}
                onMouseLeave={() => setCandidatesHovered(false)}
              >
                <div className={`relative bg-gradient-to-br ${candidatesHovered ? 'from-purple-50 to-purple-100/50' : 'from-white to-purple-50/30'} rounded-3xl p-8 border-2 ${candidatesHovered ? 'border-purple-200' : 'border-gray-200/50'} transition-all duration-500 transform ${candidatesHovered ? 'scale-105' : 'scale-100'} shadow-xl hover:shadow-2xl backdrop-blur-sm h-full flex flex-col`}>
                  {/* Header */}
                  <motion.div
                    className="flex items-center mb-8"
                    whileHover={{ x: -5 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Job Candidates
                      </h3>
                      <p className="text-purple-600/80 font-medium">Accelerate Your Career</p>
                    </div>
                  </motion.div>
  
                  {/* Hero Content */}
                  <div className="mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                      Get matched with perfect opportunities, track your applications in real-time, and receive instant feedback - all at no cost.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 shadow-xl"
                      >
                        Find Jobs Now
                        <Star className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
  
                  {/* Features Grid */}
                  <div className="space-y-4 flex-1">
                    {candidateFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 30 }}
                        animate={sectionInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                        whileHover={{ x: -10, scale: 1.02 }}
                        className="group"
                      >
                        <div className="flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300 shadow-sm hover:shadow-md">
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                            whileHover={{ x: -3 }}
                          >
                            <ArrowRight className="w-4 h-4 text-purple-500 rotate-180" />
                          </motion.div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                              {feature.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {feature.description}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center ml-4 group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
  
                  {/* View All Features */}
                  <motion.div 
                    className="mt-6 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center w-full py-2 rounded-lg hover:bg-purple-50/50 transition-all" onClick={()=>navigate("/candidate-features")}>
                      <span>View All Candidate Features</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </motion.div>
  
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-lg" />
                </div>
              </motion.div>
            </div>
  
            {/* Connecting Element - Centered between cards */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </div>
  
          {/* Bottom Statistics or CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Ready to Experience Both Sides?
                  </h3>
                  <p className="text-gray-600 text-lg">Join thousands who love our unified platform</p>
                </div>
                
                <motion.div
                  className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-xl"
                  >
                    Get Started Free
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }