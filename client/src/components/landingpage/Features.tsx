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

const hrFeatures = [
  {
    icon: DollarSign,
    title: "Unlimited Free Job Postings",
    description: "Post unlimited jobs with zero cost, no hidden fees, forever free"
  },
  {
    icon: Building2,
    title: "Company Management",
    description: "Manage multiple companies and departments from one dashboard"
  },
  {
    icon: UserCheck,
    title: "Smart Candidate Matching",
    description: "AI-powered matching connects you with the best candidates instantly"
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track hiring metrics, performance, and optimize your recruitment process"
  },
  {
    icon: Clock4,
    title: "Time-Saving Automation",
    description: "Automate screening, scheduling, and follow-ups to focus on what matters"
  },
  {
    icon: GraduationCap,
    title: "Skill Assessment Tools",
    description: "Built-in tests and assessments to evaluate candidate capabilities"
  }
];

const candidateFeatures = [
  {
    icon: Laptop,
    title: "Job Discovery",
    description: "Find relevant jobs based on your skills, location, and preferences"
  },
  {
    icon: Activity,
    title: "Application Tracking",
    description: "Track all your applications and get real-time status updates"
  },
  {
    icon: Users,
    title: "Direct Communication",
    description: "Chat directly with HR and hiring managers throughout the process"
  },
  {
    icon: RefreshCw,
    title: "Profile Optimization",
    description: "AI suggestions to improve your profile and increase visibility"
  },
  {
    icon: CheckCircle2,
    title: "Skill Verification",
    description: "Showcase your skills with verified assessments and certifications"
  },
  {
    icon: Star,
    title: "Career Growth",
    description: "Access to career resources, tips, and growth opportunities"
  }
];

export function Features() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Powerful Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="text-blue-600 block">Hire & Get Hired</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features needed for successful recruitment, 
            whether you're hiring talent or looking for your next opportunity.
          </p>
        </div>

        {/* Two Column Comparison Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* HR Features Column */}
          <div className="space-y-8 p-8 bg-white rounded-2xl border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-in-left">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                <Building2 className="w-4 h-4 mr-2" />
                For HR Professionals
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Streamline Your Hiring Process</h3>
              <p className="text-lg text-gray-600">Powerful tools to find and manage the best talent</p>
            </div>
            
            <div className="space-y-6">
              {hrFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Features Column */}
          <div className="space-y-8 p-8 bg-white rounded-2xl border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-in-right">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
                <Users className="w-4 h-4 mr-2" />
                For Job Seekers
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Find Your Dream Job</h3>
              <p className="text-lg text-gray-600">Advanced tools to showcase your skills and connect with employers</p>
            </div>
            
            <div className="space-y-6">
              {candidateFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${(index + 6) * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <feature.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white animate-scale-in">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies and candidates already using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={() => navigate('/signup/hr')}
            >
              <Zap className="mr-2 w-5 h-5" />
              Start Hiring
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
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