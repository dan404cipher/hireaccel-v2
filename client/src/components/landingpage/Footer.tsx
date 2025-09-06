import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  // product: [
  //   { name: "Features", href: "#features" },
  //   { name: "How it Works", href: "#how-it-works" },
  //   { name: "Pricing", href: "#pricing" },
  //   { name: "API", href: "#api" }
  // ],
  company: [
    { name: "About Us", href: "https://v-accel.ai/" },
    { name: "Careers", href: "https://v-accel.ai/" },
    { name: "Contact", href: "https://v-accel.ai/" },
    { name: "Blog", href: "https://v-accel.ai/" }
  ],
  support: [
    { name: "Help Center", href: "#help" },
    { name: "Documentation", href: "#docs" },
    { name: "Training", href: "#training" },
    { name: "Status", href: "#status" }
  ],
  legal: [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
    { name: "GDPR", href: "#gdpr" }
  ]
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" }
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-20 space-x-5">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-semibold">HireAccel</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Accelerating the connection between top talent and leading companies through intelligent hiring solutions.
            </p>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3" />
                <span>support@hireaccel.in</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3" />
                <a 
                  href="tel:+919962056381" 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  +91 99620 56381
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3" />
                <span>Perungudi, Chennai, India</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {/* <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          <div className="space-y-5">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 HireAccel. All rights reserved.
          </p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}