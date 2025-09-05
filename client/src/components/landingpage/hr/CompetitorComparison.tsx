import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, IndianRupee, Users, Zap, Shield, Star, TrendingUp, Award, Building2, Newspaper, Search, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    competitor1: "20-50 per month",
    competitor2: "10-25 per month",
    competitor3: "5-15 per month"
  },
  {
    feature: "AI-Powered Matching",
    hireAccel: "Advanced AI",
    competitor1: "Basic search filters",
    competitor2: "Smart search",
    competitor3: "Keyword matching"
  },
  {
    feature: "Real-time Tracking",
    hireAccel: "Full tracking",
    competitor1: "Basic analytics",
    competitor2: "Limited tracking",
    competitor3: "Manual tracking"
  },
  {
    feature: "Specialist Agents",
    hireAccel: "Dedicated agents",
    competitor1: "Account manager",
    competitor2: "Email support",
    competitor3: "Self-service"
  },
  {
    feature: "Hire & Train Model",
    hireAccel: "Complete program",
    competitor1: "Not available",
    competitor2: "Not available",
    competitor3: "Not available"
  },
  {
    feature: "Candidate Database",
    hireAccel: "300+ ready candidates",
    competitor1: "Resume database",
    competitor2: "Limited database",
    competitor3: "Basic search"
  },
  {
    feature: "Support",
    hireAccel: "24/7 Free support",
    competitor1: "Business hours",
    competitor2: "Email support",
    competitor3: "Help center only"
  },
  {
    feature: "Setup Fee",
    hireAccel: "Free",
    competitor1: "₹50,000",
    competitor2: "₹30,000",
    competitor3: "₹25,000"
  }
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
      "AI-powered matching",
      "Real-time tracking",
      "Specialist agents",
      "Hire & Train model",
      "24/7 support",
      "300+ ready candidates",
      "No setup fees"
    ],
    isOurs: true,
    popular: true
  },
  {
    name: "Naukri Recruiter",
    logo: Building2,
    pricing: "₹29,999",
    subtitle: "per month",
    features: [
      "20-50 job postings",
      "Basic search filters",
      "Limited analytics",
      "Account manager",
      "No training program",
      "₹50,000 setup fee",
      "Resume database access",
      "Annual contract"
    ],
    isOurs: false,
    popular: false
  },
  {
    name: "TimesJobs Recruiter",
    logo: Newspaper,
    pricing: "₹18,999",
    subtitle: "per month",
    features: [
      "10-25 job postings",
      "Smart search tools",
      "Basic tracking",
      "Email support",
      "No training model",
      "₹30,000 setup fee",
      "Limited database",
      "6-month contract"
    ],
    isOurs: false,
    popular: false
  },
  {
    name: "Monster India",
    logo: Search,
    pricing: "₹15,999",
    subtitle: "per month",
    features: [
      "5-15 job postings",
      "Keyword matching",
      "Manual tracking",
      "Help center only",
      "No training",
      "₹25,000 setup fee",
      "Basic search only",
      "Self-service model"
    ],
    isOurs: false,
    popular: false
  }
];

export function CompetitorComparison() {
  const navigate=useNavigate();
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <StaticDecorations />
      
      {/* Simplified background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/6 to-cyan-400/6 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/6 to-pink-400/6 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
            <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">Why Choose HireAccel</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            See How We Compare
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            While leading Indian recruitment platforms charge lakhs annually for basic features, HireAccel delivers enterprise-grade recruitment solutions completely free. 
            See the difference and discover why smart HR teams across India are making the switch.
          </p>
        </motion.div>

        {/* Hero Comparison Image */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
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
        </motion.div>

        {/* Pricing Comparison Cards */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Pricing Comparison
            </h3>
            <p className="text-lg text-gray-600">
              See how much you can save compared to leading Indian recruitment platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitors.map((competitor, index) => (
              <motion.div
                key={competitor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`p-6 h-full relative overflow-visible ${
                  competitor.isOurs 
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl' 
                    : 'bg-white/70 backdrop-blur-sm border border-gray-200'
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
                        <span>You save ₹4,09,988/year</span>
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
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    {competitor.isOurs ? (
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={()=>navigate('/signup/hr')}> 
                        Get Started Free
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                        disabled
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Feature Comparison Table */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Feature-by-Feature Comparison
            </h3>
            <p className="text-lg text-gray-600">
              Detailed breakdown of features and capabilities
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="text-left p-4 font-medium min-w-[150px]">Features</th>
                    <th className="text-center p-4 font-medium min-w-[120px]">
                      <div className="flex items-center justify-center space-x-2">
                        <span>HireAccel</span>
                        <Crown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="text-center p-4 font-medium min-w-[120px]">Naukri Recruiter</th>
                    <th className="text-center p-4 font-medium min-w-[120px]">TimesJobs</th>
                    <th className="text-center p-4 font-medium min-w-[120px]">Monster India</th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row, index) => (
                    <motion.tr
                      key={index}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium">{row.hireAccel}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-600">{row.competitor1}</td>
                      <td className="p-4 text-center text-gray-600">{row.competitor2}</td>
                      <td className="p-4 text-center text-gray-600">{row.competitor3}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Cost Savings Calculator */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                Annual Cost Comparison
              </h3>
              <p className="text-lg text-gray-600">
                See exactly how much you save by choosing HireAccel
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { name: "HireAccel", cost: 0, color: "from-emerald-500 to-teal-600", savings: "₹4,09,988" },
                { name: "Naukri Recruiter", cost: 359988, color: "from-blue-600 to-indigo-700", setup: "₹50,000" },
                { name: "TimesJobs", cost: 227988, color: "from-orange-500 to-red-600", setup: "₹30,000" },
                { name: "Monster India", cost: 191988, color: "from-purple-500 to-violet-600", setup: "₹25,000" }
              ].map((platform, index) => (
                <motion.div
                  key={platform.name}
                  className={`bg-gradient-to-br ${platform.color} rounded-xl p-6 text-white relative overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">{platform.name}</h4>
                    <div className="text-3xl font-bold mb-2">
                      {platform.cost === 0 ? "FREE" : `₹${platform.cost.toLocaleString()}`}
                    </div>
                    <div className="text-sm opacity-90">
                      {platform.cost === 0 ? "Forever" : "per year"}
                    </div>
                    {platform.setup && (
                      <div className="text-xs mt-2 opacity-80">
                        + {platform.setup} setup
                      </div>
                    )}
                    {platform.savings && (
                      <div className="absolute -top-2 -right-2 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                        Save {platform.savings}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-white/20 rounded-full" />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-full mb-4">
                <Award className="w-5 h-5" />
                <span className="font-medium">Average savings: ₹2,59,988 per year</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cost Savings Highlight */}
        <motion.div 
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-green-200/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
              <IndianRupee className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Save Over <span className="text-green-600">₹3,50,000</span> Per Year
            </h3>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              While major Indian recruitment platforms charge premium prices for basic features, HireAccel provides everything you need completely free. 
              That's real money back in your budget for what matters most - growing your team and business.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Shield, title: "No Hidden Costs", desc: "What you see is what you get - forever free" },
                { icon: Users, title: "No User Limits", desc: "Add unlimited team members at no extra cost" },
                { icon: Zap, title: "Full Features", desc: "Access to all premium features included" }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <benefit.icon className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                  <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={()=>navigate('/signup/hr')}
            >
              Start Saving Today - It's Free!
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}