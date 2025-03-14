import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

// Define the settings interface
interface PublicSettings {
  companyName?: string;
  logoPath?: string;
  primaryColor?: string;
  theme?: string;
  radius?: number;
  siteTitle?: string;
  siteDescription?: string;
  favicon?: string;
}

// Define a consistent type for our defaulted settings value
interface NavbarSettings {
  logoPath: string | null;
  companyName: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Get company settings with properly typed default
  const { data: fetchedSettings } = useQuery<PublicSettings>({
    queryKey: ['/api/settings/public'],
  });
  
  // Create a properly typed settings object
  const settings: NavbarSettings = {
    logoPath: fetchedSettings?.logoPath || null,
    companyName: fetchedSettings?.companyName || 'SD Tech Pros',
  };
  
  // Use an effect to handle the data separately from the query
  useEffect(() => {
    console.log("Public navbar received settings:", settings);
    
    if (settings.logoPath) {
      console.log("Public navbar logo path:", settings.logoPath);
      setLogoUrl(settings.logoPath);
      
      // Try to preload the image to check if it's accessible
      const img = new Image();
      img.onload = () => console.log("Public navbar preload logo success:", settings.logoPath);
      img.onerror = (e) => console.error("Public navbar preload logo failed:", e);
      img.src = settings.logoPath;
    } else {
      setLogoUrl(null);
    }
  }, [settings.logoPath]);

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
            {/* Logo with cache busting */}
            <Link href="/" className="flex items-center">
              {logoUrl ? (
                <img 
                  src={`${logoUrl}?t=${Date.now()}`} 
                  className="h-10 w-auto" 
                  alt={settings.companyName}
                  onError={(e) => {
                    console.error("Error loading logo in public navbar:", e);
                    // Set a fallback to text logo
                    setLogoUrl(null);
                  }}
                  onLoad={() => console.log("Logo loaded successfully in public navbar:", logoUrl)}
                />
              ) : (
                <span className="text-primary-700 font-bold text-xl">{settings.companyName}</span>
              )}
            </Link>
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
