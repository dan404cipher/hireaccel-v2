import { Card, CardContent } from "./ui/card";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";

const testimonials = [
  {
    name: "Arun Krishnan",
    role: "HR Director",
    company: "Chennai TechWorks Pvt. Ltd.",
    quote: "HireAccel has made our recruitment seamless. We've cut down hiring time drastically and onboarded top local talent.",
    rating: 5
  },
  {
    name: "Priya Subramanian",
    role: "Talent Acquisition Manager",
    company: "MarinaSoft Solutions",
    quote: "The AI matching has been a game-changer. We are able to find Chennai-based candidates who fit perfectly into our company culture.",
    rating: 5
  },
  {
    name: "Karthik Ramesh",
    role: "Recruitment Head",
    company: "Velachery Innovations",
    quote: "Scheduling interviews is no longer a headache. The platform is simple, smart, and saves us hours every week.",
    rating: 5
  },
  {
    name: "Meera Natarajan",
    role: "Founder & CEO",
    company: "TidelStartups Hub",
    quote: "As a growing startup in Chennai, the free access to HireAccel has been invaluable. We can focus our funds on scaling instead of tools.",
    rating: 5
  },
  {
    name: "Suresh Kumar",
    role: "Tech Recruiter",
    company: "Anna Nagar Digital Services",
    quote: "Finally, a recruitment platform without hidden fees. The AI-driven matching system has helped us hire smarter and faster in Chennai.",
    rating: 5
  }
];

// Avatar component for displaying initials
const Avatar = ({ name, className = "" }: { name: string; className?: string }) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const gradients = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-purple-600', 
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600'
  ];
  
  const colorIndex = name.length % gradients.length;
  const bgGradient = gradients[colorIndex];

  return (
    <div className={`${bgGradient} text-white rounded-full flex items-center justify-center font-bold shadow-lg ${className}`}>
      {initials}
    </div>
  );
};

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

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useInView(0.2);
  
  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length]
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/6 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Quote className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">What People Say</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 bg-clip-text text-transparent">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            See what our customers are saying about their hiring success
          </p>
        </motion.div>

        {/* Desktop View - 3 cards */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {visibleTestimonials.map((testimonial, index) => (
                <motion.div
                  key={`${currentIndex}-${index}`}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border border-gray-200 hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm group relative overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardContent className="p-8 relative h-full flex flex-col">
                      {/* Quote icon */}
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 15 }}
                      >
                        <Quote className="h-6 w-6 text-white" />
                      </motion.div>

                      {/* Stars */}
                      <div className="flex mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * i, duration: 0.3 }}
                          >
                            <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                          </motion.div>
                        ))}
                      </div>
                      
                      <blockquote className="text-gray-700 mb-8 leading-relaxed flex-grow text-lg">
                        "{testimonial.quote}"
                      </blockquote>
                      
                      <div className="flex items-center mt-auto">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          <Avatar 
                            name={testimonial.name}
                            className="w-14 h-14 mr-4 border-3 border-white shadow-lg"
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </motion.div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">
                            {testimonial.role} at {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile View - Single card carousel */}
        <div className="md:hidden">
          <div className="relative max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{testimonials[currentIndex].quote}"
                    </p>
                    
                    <div className="flex items-center">
                      <Avatar 
                        name={testimonials[currentIndex].name}
                        className="w-12 h-12 mr-4"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonials[currentIndex].name}</div>
                        <div className="text-sm text-gray-600">
                          {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Controls */}
        <motion.div 
          className="flex justify-center items-center mt-12 space-x-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </motion.div>

          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}