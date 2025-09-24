import React, { lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { generateSrcSet, getOptimizedBackgroundStyle, getWebPUrl } from "@/utils/imageOptimization";
import talentPoolBackground from "@/assets/section1.jpg";

const domains = [
  {
    title: "Development",
    description: "Frontend, Backend, Full Stack",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=500&h=300&fit=crop&crop=center&q=80"
  },
  {
    title: "Testing & QA",
    description: "Quality assurance and testing specialists",
    image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&w=500&h=300&fit=crop&crop=center&q=80"
  },
  {
    title: "DevOps",
    description: "Infrastructure and deployment experts",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&w=500&h=300&fit=crop&crop=center&q=80"
  },
  {
    title: "Data Analytics",
    description: "Data scientists and analysts",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop&crop=center"
  },
  {
    title: "Business Analysis",
    description: "Business analysts and consultants",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop&crop=center"
  },
  {
    title: "Scrum Masters & more",
    description: "Project management and agile experts",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=300&fit=crop&crop=center"
  },
  {
    title: "UI/UX Design",
    description: "User interface and experience designers",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop&crop=center"
  },
  {
    title: "Product Management",
    description: "Product managers and strategists",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop&crop=center"
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${talentPoolBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent"></div>
      <div className="container mx-auto px-5 md:px-4 py-8 md:py-20 relative z-10 h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-5">
          <h2 className="text-2xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-bold text-white">
            Our Growing Talent Pool
          </h2>
          <p className="mt-4 text-xs sm:text-md md:text-lg lg:text-xl xl-text-xl 2xl:text-xl text-gray-300">
            We connect you with over 300 ready-to-join candidates
          </p>
        </div>

        {/* Domains Covered */}
        <div className="mb-16">
          <h3 className="text-md sm:text-lg md:text-xl lg:text-2xl xl-text-2xl 2xl:text-2xl font-semibold text-center mb-5 text-white">
            Domains Covered
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-2xl min-h-[250px] shadow-lg hover:shadow-xl transition-all duration-300"
                style={getOptimizedBackgroundStyle(getWebPUrl(domain.image))}
              >
                {/* Transparent Header Section */}
                <div className="bg-black/50 backdrop-blur-md h-16 flex flex-col justify-center p-4 text-white relative z-10">
                  <h3 className="text-lg font-bold">
                    {domain.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Talent Stats */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                200+
              </div>
              <div className="text-xl font-semibold text-white mb-2">
                Experienced Professionals
              </div>
              <div className="text-gray-300 leading-relaxed">
                Industry-ready experts for immediate deployment
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                100+
              </div>
              <div className="text-xl font-semibold text-white mb-2">
                Trained Freshers
              </div>
              <div className="text-gray-300 leading-relaxed">
                Job-ready talent trained in real-world IT skills
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}