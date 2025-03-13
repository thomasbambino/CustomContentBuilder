import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Header from "./header";
import Sidebar from "./sidebar";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export default function AppLayout({ 
  children, 
  requireAuth = false,
  adminOnly = false 
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect if auth is required but user is not logged in
  if (requireAuth && !user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect if admin access is required but user is not an admin
  if (adminOnly && (!user || user.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header onMenuToggle={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        
        <main className={`flex-1 overflow-auto pt-16 ${user ? 'lg:pl-64' : ''}`}>
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
