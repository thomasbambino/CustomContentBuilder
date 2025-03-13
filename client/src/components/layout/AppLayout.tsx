import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState("light");
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);
  
  // Apply theme changes to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);
  
  // Define which pages should show the sidebar
  const shouldShowSidebar = () => {
    return user && (
      location.startsWith('/admin') || 
      location.startsWith('/client')
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Only show header and sidebar for authenticated pages */}
      {user && (
        <>
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            themeMode={themeMode}
            setThemeMode={setThemeMode}
          />
          
          {shouldShowSidebar() && (
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          )}
        </>
      )}
      
      <main className={cn(
        "flex-1",
        user ? "pt-16" : "",
        shouldShowSidebar() ? "lg:pl-64" : ""
      )}>
        {children}
      </main>
    </div>
  );
}

// Helper function to combine class names
function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
