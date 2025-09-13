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
  navItems = [
    { label: "Features", id: "features" },
    { label: "Why Choose", id: "why-choose" },
    { label: "Testimonials", id: "testimonials" },
    { label: "Contact", id: "contact" }
  ], 
  showAuthButtons = true,
  onBackToHome
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src={logoColor} alt="HireAccel Logo" className="h-10 w-10" />
            <div>
              <h1 className={`font-bold text-lg font-milker ${isScrolled ? 'text-gray-900' : 'text-white'}`}>Hire Accel</h1>
              <p className={`text-xs font-medium font-milker ${isScrolled ? 'text-gray-600' : 'text-white/80'}`}>powered by v-accel</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item)}
                className={`font-medium font-milker transition-colors duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-blue-600' 
                    : 'text-white hover:text-blue-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          {showAuthButtons && (
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className={isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-300"}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/signup')}
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
            className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
              isScrolled 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item)}
                  className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              
              {showAuthButtons && (
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="justify-start text-gray-700 hover:text-blue-600"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="justify-start bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:!text-white animate-gradient-x transition-all duration-300 ease-in-out rounded-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}