import { Button } from "./ui/button";
import { ArrowRight, CheckCircle, Sparkles, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ctaBackground from "@/assets/cta-backgroung.jpg";
const benefits = [
  { text: "Forever free platform", icon: Sparkles, color: "bg-yellow-400" },
  { text: "No hidden costs ever", icon: Target, color: "bg-green-400" },
  { text: "Unlimited job postings", icon: Users, color: "bg-blue-400" },
  {
    text: "Full AI-powered features",
    icon: CheckCircle,
    color: "bg-purple-400",
  },
];

export function CTA() {
  const navigate = useNavigate();

  return (
    <section
      className="py-20 relative"
      style={{
        backgroundImage: `url(${ctaBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Simple background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join the Revolution in Free AI Recruitment
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of HR professionals and job seekers using our
            permanently free platform. No hidden costs, no subscriptions, no
            limits - just powerful AI recruitment tools forever.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-slide-up">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-200"
            >
              <div
                className={`w-12 h-12 ${benefit.color} rounded-full flex items-center justify-center mb-3`}
              >
                <benefit.icon className={`h-6 w-6 text-white`} />
              </div>
              <span className="text-white text-sm font-medium text-center leading-tight">
                {benefit.text}
              </span>
            </div>
          ))}
        </div>

        {/* <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8 animate-scale-in">
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 font-semibold text-lg shadow-2xl transition-all duration-200"
            onClick={() => navigate("/signup")}
          >
            Sign Up - It's Free Forever
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 font-semibold text-lg backdrop-blur-sm bg-white/10 transition-all duration-200"
            onClick={() => navigate('/hr')}
          >
            Learn More
          </Button>
        </div> */}

        <div className="mb-8 animate-scale-in">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-3 mb-6 bg-gradient-to-r from-yellow-400/20 via-green-400/20 to-blue-400/20 backdrop-blur-md rounded-full border-2 border-white/30">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="text-white text-lg font-bold tracking-wide">
              Sign Up - It's Free Forever
            </span>
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 font-semibold text-lg shadow-2xl transition-all duration-200"
              onClick={() => navigate("/register/hr")}
            >
              For HR
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 font-semibold text-lg shadow-2xl transition-all duration-200"
              onClick={() => navigate("/register/candidate")}
            >
              For Job Seekers
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 text-white animate-fade-in">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="font-medium">300+ Candidates</span>
          </div>
          <span className="text-white/50">•</span>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="font-medium">Zero Cost Forever</span>
          </div>
        </div>
      </div>
    </section>
  );
}
