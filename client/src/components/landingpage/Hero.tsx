import { Button } from "./ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBackground from '@/assets/Hero-background.jpeg';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Enhanced gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10 h-full">
        <div className="grid grid-cols-3 gap-8 h-full min-h-[80vh] items-start pt-20">
          {/* Left Column - Main Content */}
          <div className="col-span-2 flex flex-col space-y-8 p-4">
            <div className="space-y-4">
              <h1 className="text-7xl lg:text-7xl font-black text-white font-inter leading-tight">
                FIND THE PERFECT
              </h1>
              <span className="text-7xl lg:text-7xl font-black text-white font-inter italic leading-tight">
                TALENT MATCH
              </span>
            </div>
            
            <p className="text-lb text-white/80 leading-relaxed font-inter max-w-lg">
              A completely free AI-powered recruitment platform for HR professionals and job seekers — featuring unlimited job postings, real-time tracking, specialist agents, and a comprehensive Hire & Train model.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                onClick={() => navigate('/signup/hr')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline backround-transparent" 
                size="lg" 
                className="border-none background-transparent text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/signup/candidate')}
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Column - Empty space or additional content can go here */}
          <div className="flex flex-col justify-center items-center p-4">
            {/* This space is available for future content */}
          </div>
        </div>

        {/* Hero Footer Section - Statistics */}
        <div className="absolute bottom-0 left-0 right-0 bg-transparent backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-2xl font-bold text-white font-inter">300+</span>
                </div>
                <p className="text-white/80 text-sm font-inter">Ready Candidates</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-2xl font-bold text-white font-inter">200+</span>
                </div>
                <p className="text-white/80 text-sm font-inter">Professionals</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-2xl font-bold text-white font-inter">100%</span>
                </div>
                <p className="text-white/80 text-sm font-inter">Free Forever</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}