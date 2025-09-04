import { Button } from "./ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "Why Choose", id: "why-choose" },
    { label: "Testimonials", id: "testimonials" },
    { label: "Contact", id: "contact" }
  ];

  return (
    <motion.header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg' 
          : 'bg-white/80 backdrop-blur-md border-b border-gray-200/30'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              // className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3 flex items-center justify-center shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                  "0 10px 15px -3px rgba(59, 130, 246, 0.4)",
                  "0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* <Sparkles className="w-5 h-5 text-white" /> */}
            </motion.div>
            <img src={logo} alt="HireAccel" className="w-30 h-10" />
            {/* <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              HireAccel
            </span> */}
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
            onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => navigate("/signup")}>
                Sign Up Free
              </Button>
            </motion.div>
          </div>

          <motion.button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl rounded-b-2xl border-t border-gray-200/50"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="flex flex-col space-y-1 p-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left py-3 px-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 5 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <motion.div 
                  className="flex flex-col space-y-3 pt-4 border-t border-gray-200/50"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Button variant="ghost" className="justify-start hover:bg-blue-50 hover:text-blue-600">
                    Sign In
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    Sign Up Free
                  </Button>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}