import { Button } from "./ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoColor from "../../assets/logo-color.png";

interface NavItem {
  label: string;
  id?: string;
  action?: () => void;
  href?: string;
}

interface HeaderProps {
  navItems?: NavItem[];
  showAuthButtons?: boolean;
  onBackToHome?: () => void;
}

export function Header({
  navItems = [],
  showAuthButtons = true,
  onBackToHome,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled past the hero section (approximately 100vh - header height)
      const heroHeight = window.innerHeight - 64; // 64px is header height
      const heroFooterOffset = heroHeight - 50; // Trigger a bit later, closer to the actual footer
      setIsScrolled(window.scrollY > heroFooterOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    } else if (item.id) {
      scrollToSection(item.id);
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      style={{ background: "#80808052" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logoColor} alt="HireAccel Logo" className="h-10 w-10" />
            <div>
              <h1 className="font-bold text-sm md:text-lg font-inter text-white">
                Hire Accel
              </h1>
              <p className="text-xs font-medium font-inter text-white/80">
                powered by v-accel
              </p>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          {showAuthButtons && (
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-white hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Sign In
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/register/hr")}
                className="text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                For Employer
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/register/Candidate")}
                className="text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                For Job Seekers
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:!text-white animate-gradient-x transition-all duration-300 ease-in-out rounded-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors duration-200 text-white hover:bg-white/10"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Auth Menu */}
        {isMenuOpen && showAuthButtons && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2 px-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="justify-start text-gray-700 hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/register-hr")}
                className="justify-start text-gray-700 hover:bg-gray-100 transition-all duration-300"
              >
                For Employer
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/register-Candidate")}
                className="justify-start text-gray-700 hover:bg-gray-100 transition-all duration-300"
              >
                For job seekers
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="justify-start bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:!text-white animate-gradient-x transition-all duration-300 ease-in-out rounded-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
