import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, IndianRupee, Users, Zap, Shield, Star, TrendingUp, Award, Building2, Newspaper, Search, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import comparebg from "@/assets/section1.jpg";
import pricecomparebg from "@/assets/bg.png";
import featurecomparebg from "@/assets/bg.webp";
import annualcostcomparebg from "@/assets/btbg2.jpg";


// Simplified static decorative elements
function StaticDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute top-20 left-10 w-8 h-8 bg-blue-400 rounded-full"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full"></div>
      <div className="absolute bottom-40 left-20 w-4 h-4 bg-cyan-400 rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-10 h-10 bg-pink-400 rounded-full"></div>
    </div>
  );
}

// Feature comparison data
const featureComparison = [
  {
    feature: "Job Postings",
    hireAccel: "Unlimited Free",
    competitor1: "25 per month",
    competitor2: "25 per month",
    competitor3: "25 per month"
  },
  {
    feature: "AI-Powered Matching",
    hireAccel: "Advanced AI + Human verification",
    competitor1: "Smart search filters",
    competitor2: "Basic matching algorithm",
    competitor3: "Keyword-based search"
  },
  {
    feature: "Application Management",
    hireAccel: "Full ATS Integration",
    competitor1: "Advanced ATS feature",
    competitor2: "Basic tracking",
    competitor3: "Manual management"
  },
  {
    feature: "Dedicated Support",
    hireAccel: "Personal recruitment agents",
    competitor1: "Account manager (₹3L+ plans)",
    competitor2: "Email/phone support",
    competitor3: "Help desk only"
  },
  {
    feature: "Employer Branding",
    hireAccel: "Included",
    competitor1: "Additional ₹50K/year",
    competitor2: "Additional ₹30K/year",
    competitor3: "Not available"
  },
  {
    feature: "Interview Scheduling",
    hireAccel: "Built-in scheduler",
    competitor1: "Video interviewing extra",
    competitor2: "Basic calender sync",
    competitor3: "Manual coordination"
  },
  {
    feature: "CV Database Access",
    hireAccel: "300+ pre-verified profiles",
    competitor1: "5 Lakh+ database access",
    competitor2: "3 Lakh+  profiles",
    competitor3: "1.5 Lakh+  profiles"
  },
  {
    feature: "Analytics & Reports",
    hireAccel: "Real-time dashboards",
    competitor1: "Advanced analytics",
    competitor2: "Standard reports",
    competitor3: "Basic metrics"
  },
  {
    feature: "Training & Onboarding",
    hireAccel: "Free dedicated training",
    competitor1: "Self-service onboarding",
    competitor2: "Basic training materials",
    competitor3: "Help documentation only"
  },


];

// Competitor pricing data
const competitors = [
  {
    name: "HireAccel",
    logo: Rocket,
    pricing: "FREE",
    subtitle: "Forever",
    features: [
      "Unlimited job postings",
      "AI + human agent matching",
      "300+ pre-verified candidates",
      "Personal recruitment agents",
      "Real-time ATS Integration",
      "Interview scheduling",
      "Analytics dashboard",
      "Free onboarding & training"
    ],
    isOurs: true,
    popular: true
  },
  {
    name: "Naukri Recruiter",
    logo: Building2,
    pricing: "₹37,500",
    subtitle: "per month (approx)",
    features: [
      "25 job postings/month",
      "5L+ CV database access",
      "Smart search filters",
      "Account manager (premium only)",
      "Basic ATS features",
      "Standard reporting",
      "Email/phone support",
      "Self-service onboarding"
    ],
    isOurs: false,
    popular: false
  },
  {
    name: "TimesJobs Recruiter",
    logo: Newspaper,
    pricing: "₹37,500",
    subtitle: "per month (approx)",
    features: [
      "25 job postings/month",
      "3L+ CV database access",
      "Basic matching algorithm",
      "Standard reports",
      "Email Support only",
      "Basic training materials",
      "Manual application tracking",
      "Limited customization",
    ],
    isOurs: false,
    popular: false
  },
  {
    name: "Monster India",
    logo: Search,
    pricing: "₹22,500",
    subtitle: "per month (approx)",
    features: [
      "25 job postings/month",
      "1.5+CV database access",
      "Keyword-based search",
      "Basic metrics only",
      "Help desk support",
      "Help documentation only",
      "No dedicated support",
      "Self-service model"
    ],
    isOurs: false,
    popular: false
  }
];

export function CompetitorComparison() {
  const navigate=useNavigate();
  return (
    <>
      <section className="relative min-h-screen flex flex-col justify-center items-center py-10 bg-gray-50/50 mx-auto" 
        style={{
          backgroundImage: `url(${comparebg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        {/* Section Header */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
      
      <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
        <div
          className="text-center mb-16"
        > 
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white bg-clip-text text-transparent mb-6">
            See How We Compare
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            While leading Indian recruitment platforms charge lakhs annually for basic features, HireAccel delivers enterprise-grade recruitment solutions completely free. 
            See the difference and discover why smart HR teams across India are making the switch.
          </p>
        </div>

        {/* Hero Comparison Image */}
        <div
          className="mb-10"
        >
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-2xl blur-3xl"></div>

            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1676276376140-a4030cc596a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbXBldGl0aW9uJTIwY29tcGFyaXNvbiUyMGNoYXJ0JTIwYW5hbHlzaXN8ZW58MXx8fHwxNzU2OTYxNTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Business competition comparison analysis"
                className="w-full h-auto rounded-xl"
              />
              {/* Static comparison badges */}
              <div className="absolute -top-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full font-medium shadow-lg">
                100% Free
              </div>

              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-lg">
                Save ₹3,50,000+/year
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
      <section className="relative min-h-screen flex flex-col justify-center items-center py-10 bg-gray-50/50 mx-auto" 
        style={{
          backgroundImage: `url(${pricecomparebg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
        {/* Pricing Comparison Cards */}
        <div
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white bg-clip-text text-transparent mb-4">
              Pricing Comparison
            </h3>
            <p className="text-lg text-white">
              See how much you can save compared to leading Indian recruitment platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitors.map((competitor, index) => (
              <div
                key={competitor.name}
                className="relative"
              >
                <Card className={`p-6 h-full relative overflow-visible ${
                  competitor.isOurs 
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl' 
                    : 'bg-white/90 backdrop-blur-sm border border-gray-200'
                }`}>
                  
                  {competitor.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm flex items-center font-medium shadow-lg rounded-full w-fit">
                        <Crown className="w-4 h-4 mr-1" />
                      <div className="text-white w-[90px]"> Most Popular</div>
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
                      <competitor.logo className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{competitor.name}</h4>
                    
                    <div className="mb-4">
                      {competitor.isOurs ? (
                        <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                          {competitor.pricing}
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-gray-900">
                          {competitor.pricing}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">{competitor.subtitle}</div>
                    </div>

                    {competitor.isOurs && (
                      <div className="flex items-center justify-center space-x-2 text-sm text-green-600 bg-green-50 rounded-full px-3 py-1">
                        <Check className="w-4 h-4" />
                        <span>You save ₹3,63,000/year</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {competitor.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        {competitor.isOurs ? (
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-300 rounded-full mt-0.5 flex-shrink-0" />
                        )}
                        <span 
                          className={`text-sm text-gray-700 ${featureIndex === 0 ? 'font-bold !font-bold' : ''}`}
                          style={{ 
                            fontWeight: featureIndex === 0 ? '700' : '400',
                            fontFamily: 'inherit'
                          }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    {competitor.isOurs ? (
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={()=>navigate('/register/hr')}> 
                        Get Started Free
                      </Button>
                    ) : (""
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>
      <section className="relative min-h-screen flex flex-col justify-center items-center py-10 bg-gray-50/50" 
        style={{
          backgroundImage: `url(${featurecomparebg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
        {/* Detailed Feature Comparison Table */}
        <div
          className="mb-16"
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white bg-clip-text text-transparent mb-4">
              Feature-by-Feature Comparison
            </h3>
            <p className="text-lg text-white">
              Detailed breakdown of features and capabilities
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="min-w-[280px] md:min-w-[600px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-600 to-gray-900 text-white">
                      <th className="text-left p-3 md:p-4 font-medium w-[30%] md:w-[25%]">
                        <span className="text-sm md:text-base">Features</span>
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium w-[17.5%] md:w-[18.75%]">
                        <div className="flex items-center justify-center space-x-1 md:space-x-2">
                          <span className="text-sm md:text-base whitespace-nowrap">HireAccel</span>
                          <Crown className="w-3 h-3 md:w-4 md:h-4" />
                        </div>
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium w-[17.5%] md:w-[18.75%]">
                        <span className="text-sm md:text-base whitespace-nowrap">Naukri</span>
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium w-[17.5%] md:w-[18.75%]">
                        <span className="text-sm md:text-base whitespace-nowrap">TimesJobs</span>
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium w-[17.5%] md:w-[18.75%]">
                        <span className="text-sm md:text-base whitespace-nowrap">Monster</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparison.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'} transition-colors duration-150 hover:bg-gray-700`}
                      >
                        <td className={`p-3 md:p-4 font-medium text-white text-sm md:text-base ${index === 0 ? 'font-bold' : ''}`}>
                          {row.feature}
                        </td>
                        <td className={`p-3 md:p-4 text-center ${index === 0 ? 'font-bold' : ''}`}>
                          <div className="flex items-center justify-center space-x-1 md:space-x-2">
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                            <span className={`text-green-400 shadow shadow-green-md font-medium text-sm md:text-base ${index === 0 ? 'font-bold' : ''}`}>
                              {row.hireAccel}
                            </span>
                          </div>
                        </td>
                        <td className={`p-3 md:p-4 text-center text-white text-sm md:text-base ${index === 0 ? 'font-bold' : ''}`}>
                          {row.competitor1}
                        </td>
                        <td className={`p-3 md:p-4 text-center text-white text-sm md:text-base ${index === 0 ? 'font-bold' : ''}`}>
                          {row.competitor2}
                        </td>
                        <td className={`p-3 md:p-4 text-center text-white text-sm md:text-base ${index === 0 ? 'font-bold' : ''}`}>
                          {row.competitor3}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
      <section className="relative min-h-screen flex flex-col justify-center items-center py-10 bg-gray-50/50" 
        style={{
          backgroundImage: `url(${annualcostcomparebg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
      
      <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
        {/* Cost Savings Calculator */}
        <div
          className="mb-10"
        >
          <div className="bg-gray-900 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white bg-clip-text text-transparent mb-4">
                Annual Cost Comparison
              </h3>
              <p className="text-lg text-white">
                See approximately how much you save by choosing HireAccel
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { name: "HireAccel", cost: 0, color: "from-emerald-500 to-teal-600", savings: "₹3,63,000+" },
                { name: "Naukri Recruiter", cost: 450000, color: "from-blue-600 to-indigo-700", setup: "₹50,000" },
                { name: "TimesJobs", cost: 450000, color: "from-orange-500 to-red-600", setup: "₹30,000" },
                { name: "Monster India", cost: 270000, color: "from-purple-500 to-violet-600", setup: "₹25,000" }
              ].map((platform, index) => (
                <div
                  key={platform.name}
                  className={`bg-gradient-to-br ${platform.color} rounded-xl p-6 text-white relative overflow-hidden`}
                >
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">{platform.name}</h4>
                    <div className="text-3xl font-bold mb-2">
                      {platform.cost === 0 ? "FREE" : `₹${platform.cost.toLocaleString()}`}
                    </div>
                    <div className="text-sm opacity-90">
                      {platform.cost === 0 ? "Forever" : "per year (approx)"}
                    </div>
                  
                    {platform.savings && (
                      <div className="absolute -top-2 -right-2 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                        Save {platform.savings}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-white/20 rounded-full" />
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-full mb-4">
                <Award className="w-5 h-5" />
                <span className="font-medium">Average savings: ₹3,63,000+ per year</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
      <section className="relative min-h-screen flex flex-col justify-center items-center py-10 bg-gray-50/50 mx-auto" 
        style={{
          backgroundImage: `url(${pricecomparebg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10"></div>
      
      <div className="container mx-auto px-5 md:px-4 py-8 md:py-10 relative z-10 h-full">
        {/* Cost Savings Highlight */}
        <div
          className="bg-gray-900 rounded-2xl p-8 md:p-12 border border-green-200/50"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
              <IndianRupee className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Save Over <span className="text-green-600">₹3,60,000</span> Per Year
            </h3>
            
            <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
              While major Indian recruitment platforms charge premium prices for basic features, HireAccel provides everything you need completely free. 
              That's real money back in your budget for what matters most - growing your team and business.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Shield, title: "No Hidden Costs", desc: "What you see is what you get - forever free", color:"green" },
                { icon: Users, title: "No User Limits", desc: "Add unlimited team members at no extra cost", color:"blue"  },
                { icon: Zap, title: "Full Features", desc: "Access to all premium features included", color:"yellow"  }
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-gray-900 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20"
                >
                  <benefit.icon className={`w-8 h-8 text-${benefit.color}-600 mb-3 mx-auto`}/>
                  <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                  <p className="text-sm text-white">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={()=>navigate('/register/hr')}
            >
              Start Saving Today - It's Free!
            </Button>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}