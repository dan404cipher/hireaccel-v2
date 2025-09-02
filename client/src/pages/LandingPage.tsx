import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  Brain, 
  LineChart, 
  Clock, 
  GraduationCap,
  Code,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Building2,
  BarChart,
  UserCheck,
  Activity,
  Bot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = {
    hr: [
      { title: "Unlimited Free Job Postings", description: "Post any number of jobs at no cost", icon: Briefcase },
      { title: "Multi-Company Dashboard", description: "Manage multiple companies in one place", icon: Building2 },
      { title: "Specialist HR Agent", description: "Dedicated support for the right hire", icon: UserCheck },
      { title: "Advanced Analytics", description: "Track every interview stage & feedback", icon: LineChart },
      { title: "24/7 Support", description: "Always connected to our recruitment experts", icon: Clock },
      { title: "Hire & Train Model", description: "Request freshers or lateral hires to be trained in specific skills", icon: GraduationCap },
      { title: "Complete IT Solutions", description: "All your IT requirements handled with professional expertise", icon: Code },
    ],
    candidate: [
      { title: "Personal Interview Dashboard", description: "Track L1, L2, HR rounds in real time", icon: Activity },
      { title: "Specialist Candidate Agent", description: "Get matched to the right company with proper feedback", icon: UserCheck },
      { title: "Comprehensive Status Updates", description: "Always know where you stand", icon: BarChart },
      { title: "Instant Re-Matching", description: "Not selected? Get connected to another opening immediately", icon: Bot },
      { title: "Monitored Applications", description: "No missed opportunities", icon: Clock },
    ]
  };

  const domains = [
    "Development (Frontend, Backend, Full Stack)",
    "Testing & QA",
    "DevOps",
    "Data Analytics",
    "Business Analysis",
    "Scrum Masters & more"
  ];

  const testimonials = [
    {
      quote: "We closed positions in days instead of weeks — and at zero cost!",
      author: "HR Manager, Technology Firm"
    },
    {
      quote: "The tracking and instant re-matching saved me weeks in my job search!",
      author: "Software Developer"
    },
    {
      quote: "Fantastic pool of pre-vetted candidates. The Hire & Train model worked exceptionally well for us.",
      author: "CTO, Startup Company"
    },
    {
      quote: "Clean interface and real-time updates made coordination effortless.",
      author: "Senior Recruiter, Enterprise"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          AI-powered recruitment
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          Connecting Talent with Opportunity – Smarter, Faster, Free
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/signup?role=hr")} className="text-lg">
            Start as HR Professional
          </Button>
          <Button size="lg" onClick={() => navigate("/signup?role=candidate")} variant="outline" className="text-lg">
            Start as Job Candidate
          </Button>
        </div>
      </section>

      {/* For HR Professionals */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">For HR Professionals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.hr.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" onClick={() => navigate("/signup?role=hr")}>
            Hire the Right Talent →
          </Button>
        </div>
      </section>

      {/* For Job Candidates */}
      <section className="container mx-auto px-4 py-20 bg-secondary/10">
        <h2 className="text-3xl font-bold mb-12 text-center">For Job Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.candidate.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" onClick={() => navigate("/signup?role=candidate")}>
            Find Your Next Job →
          </Button>
        </div>
      </section>

      {/* Talent Pool */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Our Growing Talent Pool</h2>
        <p className="text-xl text-center mb-12">We connect you with over 300 ready-to-join candidates:</p>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Domains */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-6">Domains Covered</h3>
              <ul className="space-y-4">
                {domains.map((domain, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    <span>{domain}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Ready Talent */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-6">Ready Talent</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-medium mb-2">Over 200 Experienced Professionals</h4>
                  <p className="text-muted-foreground">Industry-ready experts for immediate deployment</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-2">Over 100 Trained Freshers</h4>
                  <p className="text-muted-foreground">Job-ready talent trained in real-world IT skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose */}
      <section className="container mx-auto px-4 py-20 bg-secondary/10">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Hire Accel?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <p>Free for HRs & Candidates</p>
          </div>
          <div className="text-center">
            <UserCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            <p>Specialist Agents for Both Sides</p>
          </div>
          <div className="text-center">
            <LineChart className="w-12 h-12 text-primary mx-auto mb-4" />
            <p>Real-Time Tracking & Analytics</p>
          </div>
          <div className="text-center">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <p>AI-Powered Candidate Matching</p>
          </div>
          <div className="text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
            <p>Hire & Train Support for Any IT Skill</p>
          </div>
          <div className="text-center">
            <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
            <p>24/7 Recruitment Assistance</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">What People Say</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <MessageSquare className="w-8 h-8 text-primary mb-4" />
                <p className="text-lg mb-4 italic">{testimonial.quote}</p>
                <p className="text-sm text-muted-foreground">– {testimonial.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center bg-secondary/10">
        <h2 className="text-3xl font-bold mb-6">Ready to Hire or Get Hired?</h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Whether you need experienced professionals, trained freshers, or a custom Hire & Train program, 
          Hire Accel is your smart recruitment partner.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/signup?role=hr")}>
            Start as HR Professional
          </Button>
          <Button size="lg" onClick={() => navigate("/signup?role=candidate")} variant="outline">
            Start as Job Candidate
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Hire Accel — Powered by V-Accel AI Dynamics Private Limited</p>
        <p>Perungudi, Chennai, India · © 2025 All Rights Reserved.</p>
      </footer>
    </div>
  );
}
