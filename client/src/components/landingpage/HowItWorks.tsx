import { DollarSign, Users, Activity, Bot, GraduationCap, Clock4, IndianRupee } from "lucide-react";
import section1Background from "@/assets/section1.jpg";
import { usePreloadedImage } from '@/utils/imageOptimization';

const reasons = [
  {
    icon: IndianRupee,
    title: "Free for HRs & Candidates",
    description: "Complete recruitment solution at no cost for both parties"
  },
  {
    icon: Users,
    title: "Specialist Agents for Both Sides",
    description: "Dedicated support agents for HR professionals and job seekers"
  },
  {
    icon: Activity,
    title: "Real-Time Tracking & Analytics",
    description: "Monitor every step of the recruitment process with detailed insights"
  },
  {
    icon: Bot,
    title: "AI-Powered Candidate Matching",
    description: "Intelligent algorithms ensure perfect candidate-job fit"
  },
  {
    icon: GraduationCap,
    title: "Hire & Train Support for Any IT Skill",
    description: "Custom training programs to build talent according to your needs"
  },
  {
    icon: Clock4,
    title: "24/7 Recruitment Assistance",
    description: "Round-the-clock support from our recruitment experts"
  }
];

export function HowItWorks() {
  const { isLoaded } = usePreloadedImage(section1Background);
  
  return (
    <section 
      id="why-choose" 
      className="py-20 relative"
      style={{
        backgroundImage: isLoaded ? `url(${section1Background})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a1a1a' // Fallback color while loading
      }}
    >
      {/* Black overlay with blur for better text readability and visual appeal */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Why Choose Hire Accel?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => {
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
            return (
            <div key={index} className="text-center">
              <div className="relative inline-block mb-6">
                <div className={`w-16 h-16 ${colors[index]} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                  <reason.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-white">{reason.title}</h3>
              <p className="text-white/90 leading-relaxed">
                {reason.description}
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}