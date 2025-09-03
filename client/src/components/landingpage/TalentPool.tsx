import { Code, TestTube, Server, BarChart3, Users, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const domains = [
  {
    icon: Code,
    title: "Development",
    description: "Frontend, Backend, Full Stack"
  },
  {
    icon: TestTube,
    title: "Testing & QA",
    description: "Quality assurance and testing specialists"
  },
  {
    icon: Server,
    title: "DevOps",
    description: "Infrastructure and deployment experts"
  },
  {
    icon: BarChart3,
    title: "Data Analytics",
    description: "Data scientists and analysts"
  },
  {
    icon: Users,
    title: "Business Analysis",
    description: "Business analysts and consultants"
  },
  {
    icon: Settings,
    title: "Scrum Masters & more",
    description: "Project management and agile experts"
  }
];

const talentStats = [
  {
    number: "200+",
    title: "Experienced Professionals",
    description: "Industry-ready experts for immediate deployment"
  },
  {
    number: "100+",
    title: "Trained Freshers",
    description: "Job-ready talent trained in real-world IT skills"
  }
];

export function TalentPool() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Our Growing Talent Pool
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            We connect you with over 300 ready-to-join candidates
          </p>
        </div>

        {/* Domains Covered */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-12 text-gray-800">
            Domains Covered
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {domains.map((domain, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <domain.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{domain.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {domain.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ready Talent Stats */}
        <div>
          <h3 className="text-2xl font-semibold text-center mb-12 text-gray-800">
            Ready Talent
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {talentStats.map((stat, index) => (
              <Card key={index} className="text-center p-8 bg-white border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300">
                <CardContent className="pt-6">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
                    {stat.number}
                  </div>
                  <CardTitle className="text-xl mb-3 text-gray-800">
                    {stat.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}