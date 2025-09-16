import { Star, Quote } from "lucide-react";
import section1Background from "@/assets/section1.jpg";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "HR Director",
    company: "TechCorp",
    content: "This platform has revolutionized our hiring process. We've reduced time-to-hire by 60% and found amazing talent.",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    company: "Google",
    content: "The job matching is incredible. I found my dream job in just 2 weeks using this platform.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Talent Acquisition Manager",
    company: "StartupXYZ",
    content: "The AI-powered screening saves us hours every week. Highly recommend to any growing company.",
    rating: 5,
    avatar: "ER"
  },
  {
    name: "David Kim",
    role: "Product Manager",
    company: "Microsoft",
    content: "Clean interface, powerful features, and excellent support. This is the future of recruitment.",
    rating: 5,
    avatar: "DK"
  },
  {
    name: "Lisa Wang",
    role: "UX Designer",
    company: "Apple",
    content: "I love how easy it is to track applications and communicate with employers. Game changer!",
    rating: 5,
    avatar: "LW"
  },
  {
    name: "James Wilson",
    role: "CEO",
    company: "InnovateLabs",
    content: "We've hired 15 amazing people through this platform. The quality of candidates is outstanding.",
    rating: 5,
    avatar: "JW"
  }
];

export function Testimonials() {
  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  
  // Avatar background colors
  const avatarColors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];

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
      {/* Black overlay with blur for better text readability */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            What Our Users Say
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Join thousands of satisfied users who have transformed their hiring and job search experience
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative overflow-hidden">
          <div className="flex gap-8 animate-scroll">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div 
                key={`${index}-${testimonial.name}`}
                className="flex-shrink-0 w-80 h-96"
              >
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl border border-white/20 transform w-full h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Quote className="w-4 h-4 text-white" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-white/90 mb-6 leading-relaxed flex-1">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center mt-auto">
                    <div className={`w-10 h-10 ${avatarColors[index % avatarColors.length]} rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-white/70">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-fade-in">
          <div>
            <div className="text-3xl font-bold text-white mb-2">10,000+</div>
            <div className="text-white/80">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">50,000+</div>
            <div className="text-white/80">Jobs Posted</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">95%</div>
            <div className="text-white/80">Success Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
            <div className="text-white/80">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}