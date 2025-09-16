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
import { useNavigate } from "react-router-dom";
import section1Background from "@/assets/section1.jpg";

const hrFeatures = [
  {
    icon: DollarSign,
    title: "Unlimited Free Job Postings",
    description: "Post unlimited jobs with zero cost, no hidden fees, forever free",
    color: "bg-green-500"
  },
  {
    icon: Building2,
    title: "Company Management",
    description: "Manage multiple companies and departments from one dashboard",
    color: "bg-blue-500"
  },
  {
    icon: UserCheck,
    title: "Smart Candidate Matching",
    description: "AI-powered matching connects you with the best candidates instantly",
    color: "bg-purple-500"
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track hiring metrics, performance, and optimize your recruitment process",
    color: "bg-orange-500"
  },
  {
    icon: Clock4,
    title: "Time-Saving Automation",
    description: "Automate screening, scheduling, and follow-ups to focus on what matters",
    color: "bg-red-500"
  },
  {
    icon: GraduationCap,
    title: "Skill Assessment Tools",
    description: "Built-in tests and assessments to evaluate candidate capabilities",
    color: "bg-yellow-500"
  }
];

const candidateFeatures = [
  {
    icon: Laptop,
    title: "Job Discovery",
    description: "Find relevant jobs based on your skills, location, and preferences",
    color: "bg-blue-500"
  },
  {
    icon: Activity,
    title: "Application Tracking",
    description: "Track all your applications and get real-time status updates",
    color: "bg-green-500"
  },
  {
    icon: Users,
    title: "Direct Communication",
    description: "Chat directly with HR and hiring managers throughout the process",
    color: "bg-purple-500"
  },
  {
    icon: RefreshCw,
    title: "Profile Optimization",
    description: "AI suggestions to improve your profile and increase visibility",
    color: "bg-orange-500"
  },
  {
    icon: CheckCircle2,
    title: "Skill Verification",
    description: "Showcase your skills with verified assessments and certifications",
    color: "bg-green-500"
  },
  {
    icon: Star,
    title: "Career Growth",
    description: "Access to career resources, tips, and growth opportunities",
    color: "bg-yellow-500"
  }
];

export function Features() {
  const navigate = useNavigate();

  return (
    <section 
      className="py-20 relative"
      style={{
        backgroundImage: `url(${section1Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-7xl lg:text-7xl font-bold text-white mb-6">
            Everything You Need to
            <span className="text-blue-300 block">Hire & Get Hired</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features needed for successful recruitment, 
            whether you're hiring talent or looking for your next opportunity.
          </p>
        </div>

        {/* Two Column Comparison Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* HR Features Column */}
          <div className="space-y-8 p-8 bg-gradient-to-r from-blue-700/95 to-blue-800/95 backdrop-blur-sm rounded-2xl shadow-xl">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                <Building2 className="w-4 h-4 mr-2" />
                For HR Professionals
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Streamline Your Hiring Process</h3>
              <p className="text-lg text-white/90">Powerful tools to find and manage the best talent</p>
            </div>
            
            <div className="space-y-6">
              {hrFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 bg-white/20 backdrop-blur-sm rounded-xl"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                      <p className="text-white/90 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Features Column */}
          <div className="space-y-8 p-8 bg-gradient-to-r from-purple-700/95 to-purple-800/95 backdrop-blur-sm rounded-2xl shadow-xl">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
                <Users className="w-4 h-4 mr-2" />
                For Job Seekers
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Find Your Dream Job</h3>
              <p className="text-lg text-white/90">Advanced tools to showcase your skills and connect with employers</p>
            </div>
            
            <div className="space-y-6">
              {candidateFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 bg-white/20 backdrop-blur-sm rounded-xl"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                      <p className="text-white/90 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}