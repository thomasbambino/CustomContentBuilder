import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Get company settings
  const { data: settings } = useQuery({
    queryKey: ['/api/settings/public'],
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isMenuOpen]);

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            {settings?.logoPath ? (
              <img src={settings.logoPath} className="h-8 w-8 rounded" alt="Company Logo" />
            ) : (
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold">
                {settings?.companyName?.charAt(0) || 'S'}
              </div>
            )}
            {/* Company Name */}
            <span className="text-primary-700 font-bold text-xl">{settings?.companyName || 'SD Tech Pros'}</span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-10">
            <a href="#home" className="text-secondary-600 hover:text-primary-600 font-medium">Home</a>
            <a href="#services" className="text-secondary-600 hover:text-primary-600 font-medium">Services</a>
            <a href="#about" className="text-secondary-600 hover:text-primary-600 font-medium">About</a>
            <a href="#testimonials" className="text-secondary-600 hover:text-primary-600 font-medium">Testimonials</a>
            <a href="#contact" className="text-secondary-600 hover:text-primary-600 font-medium">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              className="text-secondary-600 hover:text-primary-600"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Login/Dashboard Button */}
            <Button asChild>
              <Link href={user ? (user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard') : '/auth'}>
                {user ? 'Dashboard' : 'Client Portal'}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <button 
              type="button" 
              className="md:hidden bg-white p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-secondary-200">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-secondary-600 hover:text-primary-600 font-medium">Home</a>
              <a href="#services" className="text-secondary-600 hover:text-primary-600 font-medium">Services</a>
              <a href="#about" className="text-secondary-600 hover:text-primary-600 font-medium">About</a>
              <a href="#testimonials" className="text-secondary-600 hover:text-primary-600 font-medium">Testimonials</a>
              <a href="#contact" className="text-secondary-600 hover:text-primary-600 font-medium">Contact</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
