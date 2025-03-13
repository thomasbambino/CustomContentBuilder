import { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, Menu, X } from "lucide-react";
import { useTheme } from '@/components/theme/theme-provider';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { companyName, logoUrl, theme } = useTheme();
  const { user } = useAuth();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle scroll event to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Navigation links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/#services" },
    { name: "About", href: "/#about" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Contact", href: "/#contact" }
  ];

  // Determine portal link based on user role
  const getPortalLink = () => {
    if (!user) return "/auth";
    
    return user.role === "admin" ? "/admin" : "/client";
  };

  return (
    <nav className={cn(
      "sticky top-0 bg-white py-4 transition-shadow z-50",
      scrolled && "shadow-sm border-b border-secondary-200"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            {logoUrl ? (
              <img src={logoUrl} className="h-8 w-8 rounded" alt={companyName} />
            ) : (
              <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {companyName.substring(0, 1)}
              </div>
            )}
            {/* Company Name */}
            <Link href="/">
              <a className="text-primary font-bold text-xl">{companyName}</a>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-10">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href}>
                <a className="text-secondary-600 hover:text-primary font-medium">{link.name}</a>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle - Placeholder for future implementation */}
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-secondary-600" />
              ) : (
                <MoonIcon className="h-5 w-5 text-secondary-600" />
              )}
            </Button>
            
            {/* Client Portal Button */}
            <Link href={getPortalLink()}>
              <Button>
                {user ? 'Dashboard' : 'Client Portal'}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu} 
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-secondary-600" />
              ) : (
                <Menu className="h-6 w-6 text-secondary-600" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute w-full bg-white border-b border-secondary-200 shadow-md transition-all duration-300 ease-in-out z-10",
        mobileMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0 overflow-hidden"
      )}>
        <div className="px-4 sm:px-6 space-y-1">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href}>
              <a 
                className="block py-2 text-secondary-700 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
