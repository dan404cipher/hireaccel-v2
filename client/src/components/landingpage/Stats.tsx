import { Users, Building2, Briefcase, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Users",
    color: "text-blue-400",
    bgColor: "bg-blue-500"
  },
  {
    icon: Building2,
    value: "500+",
    label: "Companies",
    color: "text-green-400",
    bgColor: "bg-green-500"
  },
  {
    icon: Briefcase,
    value: "50,000+",
    label: "Jobs Posted",
    color: "text-purple-400",
    bgColor: "bg-purple-500"
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Success Rate",
    color: "text-orange-400",
    bgColor: "bg-orange-500"
  }
];

export function Stats() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Our platform is helping companies and candidates connect every day
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}