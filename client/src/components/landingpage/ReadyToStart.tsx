import { Button } from "./ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBackground from '@/assets/Hero-background.jpeg';
import { usePreloadedImage } from '@/utils/imageOptimization';

export function ReadyToStart() {
  const navigate = useNavigate();
  const { isLoaded } = usePreloadedImage(heroBackground);

  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{
        backgroundImage: isLoaded ? `url(${heroBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a1a1a' // Fallback color while loading
      }}
    >
      {/* Enhanced gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-left bg-transparent rounded-2xl p-12 text-white animate-scale-in">
          <h3 className="text-7xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies and candidates already using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-start">
            <Button 
              size="lg" 
              className="bg-blue-800 text-white-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold"
              onClick={() => navigate('/signup/hr')}
            >
              <Zap className="mr-2 w-5 h-5" />
              Start Hiring
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white bg-purple-800 border-none hover:bg-purple-700 hover:text-white-600 px-8 py-4 text-lg font-semibold"
              onClick={() => navigate('/signup/candidate')}
            >
              <ArrowRight className="mr-2 w-5 h-5" />
              Find Jobs
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
