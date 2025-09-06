import { Button } from "./ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hero from '@/assets/main.png';
// Floating particles component
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const [typedText, setTypedText] = useState("");
  const fullText = "AI-powered recruitment";
  const navigate = useNavigate();
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <FloatingParticles />
      
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full"
              >
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Next-Gen Recruitment Platform</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-blue-600"
                >
                  |
                </motion.span>
              </h1>
              
              <motion.h2 
                className="text-2xl md:text-3xl font-semibold text-gray-700 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Connecting Talent with Opportunity – Smarter, Faster, Always Free
              </motion.h2>
              
              <motion.p 
                className="mt-6 text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                A completely free AI-powered recruitment platform for HR professionals and job seekers — featuring unlimited job postings, real-time tracking, specialist agents, and a comprehensive Hire & Train model. No hidden costs, no subscriptions, forever free.
              </motion.p>

              <motion.div 
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate("/signup")}
                  >
                    Sign Up Now
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
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
                    className="border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 px-8 py-3 backdrop-blur-sm bg-white/70 transition-all duration-300"
                    onClick={() => navigate("/signup")}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="mt-12 flex flex-wrap items-center gap-8 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                {[
                  { number: "300+", label: "Ready Candidates" },
                  { number: "200+", label: "Professionals" },
                  { number: "100%", label: "Free Forever" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                  >
                    <span className="font-bold text-blue-600">{stat.number}</span>
                    <span className="ml-1">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="lg:col-span-6 mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-3xl opacity-20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
              
              <motion.div 
                className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20"
                whileHover={{ 
                  y: -10
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <img
                      src={hero}
                    alt="Professional business team collaboration"
                    className="w-full h-auto rounded-xl"
                  />
                </motion.div>
                
                {/* Floating badges */}
                <motion.div
                  className="absolute -top-4 -left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AI-Powered
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  Forever Free
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}