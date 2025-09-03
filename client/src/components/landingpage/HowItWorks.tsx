import { DollarSign, Users, Activity, Bot, GraduationCap, Clock4 } from "lucide-react";

const reasons = [
  {
    icon: DollarSign,
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
  return (
    <section id="why-choose" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Why Choose Hire Accel?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <reason.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{reason.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}