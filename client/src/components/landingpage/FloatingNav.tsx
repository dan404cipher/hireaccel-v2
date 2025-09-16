import { useState, useEffect } from "react";

interface FloatingNavProps {
  navItems?: {
    label: string;
    id: string;
  }[];
}

export function FloatingNav({ 
  navItems = [
    { label: "Features", id: "features" },
    { label: "Why Choose", id: "why-choose" },
    { label: "Testimonials", id: "testimonials" },
    { label: "Contact", id: "contact" }
  ]
}: FloatingNavProps) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
      <div className="flex flex-col items-center space-y-4">
        {/* Navigation Dots */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-3 shadow-2xl">
          <div className="flex flex-col space-y-3">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative group transition-all duration-300 ${
                  activeSection === item.id ? 'scale-110' : 'hover:scale-105'
                }`}
                title={item.label}
              >
                {/* Dot */}
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-white shadow-lg shadow-white/50' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}></div>
                
                {/* Label on hover */}
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm">
                    {item.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
