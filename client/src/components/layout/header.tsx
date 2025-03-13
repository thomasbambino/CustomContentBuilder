import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/ui/user-menu";
import { Moon, Sun, Bell } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const { user } = useAuth();
  
  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    // Theme switching logic would go here
  };
  
  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };
  
  return (
    <header className="bg-white border-b border-gray-200 fixed inset-x-0 top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Menu Toggle */}
          <div className="flex items-center">
            <Button 
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="text-gray-500 mr-2 lg:hidden"
              aria-label="Toggle Menu"
            >
              <i className="ri-menu-line text-xl"></i>
            </Button>
            
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="bg-primary text-white font-bold text-xl px-2 py-1 rounded mr-2">SD</span>
              <span className="text-primary-800 font-semibold text-lg hidden md:block">Tech Pros</span>
            </Link>
          </div>
          
          {/* Right: User Menu & Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Toggle Theme"
            >
              {themeMode === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {/* Notifications */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            )}
            
            {/* User Menu */}
            {user ? (
              <UserMenu initials={getUserInitials()} name={`${user.firstName} ${user.lastName}`} />
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">Log In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
