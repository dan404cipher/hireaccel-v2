import { Button } from "./ui/button";
import { ArrowRight, CheckCircle, Sparkles, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
const benefits = [
  { text: "Forever free platform", icon: Sparkles },
  { text: "No hidden costs ever", icon: Target },
  { text: "Unlimited job postings", icon: Users },
  { text: "Full AI-powered features", icon: CheckCircle }
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

export function CTA() {
  const [ref, inView] = useInView(0.3);
  const navigate = useNavigate();
  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            animate={{ 
              textShadow: [
                "0 0 0 rgba(255,255,255,0)",
                "0 0 20px rgba(255,255,255,0.3)",
                "0 0 0 rgba(255,255,255,0)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Join the Revolution in Free AI Recruitment
          </motion.h2>
          
          <motion.p 
            className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Join thousands of HR professionals and job seekers using our permanently free platform. No hidden costs, no subscriptions, no limits - just powerful AI recruitment tools forever.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.1)"
              }}
            >
              <motion.div
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <benefit.icon className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-white text-sm font-medium text-center leading-tight">
                {benefit.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
              onClick={() => navigate("/signup")}
            >
              Sign Up - It's Free Forever
              <motion.div
                className="ml-3"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 font-semibold text-lg backdrop-blur-sm bg-white/10 transition-all duration-300"
              onClick={()=>navigate('/hr')}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center space-x-4 text-blue-200"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center space-x-2"
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">300+ Candidates</span>
          </motion.div>
          <span className="text-blue-300">•</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Zero Cost Forever</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}