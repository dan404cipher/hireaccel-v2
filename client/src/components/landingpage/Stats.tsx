import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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

// Counter animation component
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}</span>;
}

const stats = [
  { number: 300, suffix: "+", label: "Ready-to-Join Candidates", description: "Qualified professionals available now" },
  { number: 200, suffix: "+", label: "Experienced Professionals", description: "Industry-ready experts" },
  { number: 100, suffix: "+", label: "Trained Freshers", description: "Job-ready talent with real-world skills" },
  { number: 0, suffix: "", special: "100% FREE", label: "Forever", description: "No hidden costs, no subscriptions" }
];

export function Stats() {
  const [ref, inView] = useInView(0.3);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-blue-100">
            Numbers that speak for our success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center h-full"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group relative h-full flex flex-col"
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.special ? (
                    <motion.span
                      animate={{ 
                        scale: [1, 1.1, 1],
                        textShadow: [
                          "0 0 0 rgba(255,255,255,0)",
                          "0 0 20px rgba(255,255,255,0.8)",
                          "0 0 0 rgba(255,255,255,0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {stat.special}
                    </motion.span>
                  ) : (
                    <>
                      {inView && <AnimatedCounter end={stat.number} />}
                      {stat.suffix}
                    </>
                  )}
                </div>
                <div className="text-lg font-semibold text-blue-100 mb-2 group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
                <div className="text-sm text-blue-200 leading-relaxed group-hover:text-blue-100 transition-colors duration-300 flex-1">
                  {stat.description}
                </div>

                {/* Decorative elements */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-white/50 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5 
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decorative elements */}
        <motion.div 
          className="mt-16 flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/30 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2 
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}