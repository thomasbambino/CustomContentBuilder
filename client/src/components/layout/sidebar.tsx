import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Inbox,
  LayoutTemplate,
  Palette,
  UserCog,
  Link2
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Early return if no user
  if (!user) return null;
  
  const isAdmin = user.role === 'admin';
  
  // Navigation items for admin
  const adminNavItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="text-lg mr-3" /> },
    { name: 'Clients', href: '/admin/clients', icon: <Users className="text-lg mr-3" /> },
    { name: 'Projects', href: '/admin/projects', icon: <Briefcase className="text-lg mr-3" /> },
    { name: 'Invoices', href: '/admin/invoices', icon: <FileText className="text-lg mr-3" /> },
    { name: 'Inquiries', href: '/admin/inquiries', icon: <Inbox className="text-lg mr-3" />, badge: 5 }
  ];
  
  // Content management items for admin
  const adminContentItems = [
    { name: 'Website Editor', href: '/admin/website', icon: <LayoutTemplate className="text-lg mr-3" /> },
    { name: 'Branding', href: '/admin/branding', icon: <Palette className="text-lg mr-3" /> },
    { name: 'User Management', href: '/admin/users', icon: <UserCog className="text-lg mr-3" /> },
    { name: 'API Connections', href: '/admin/api-connections', icon: <Link2 className="text-lg mr-3" /> }
  ];
  
  // Navigation items for client
  const clientNavItems = [
    { name: 'Dashboard', href: '/client/dashboard', icon: <LayoutDashboard className="text-lg mr-3" /> },
    { name: 'My Projects', href: '/client/projects', icon: <Briefcase className="text-lg mr-3" /> },
    { name: 'Invoices', href: '/client/invoices', icon: <FileText className="text-lg mr-3" /> },
    { name: 'Messages', href: '/client/messages', icon: <Inbox className="text-lg mr-3" /> },
    { name: 'Profile', href: '/client/profile', icon: <Users className="text-lg mr-3" /> }
  ];
  
  // Helper function to determine if a nav item is active
  const isActive = (href: string) => location === href;
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 w-64 fixed inset-y-0 pt-16 hidden lg:block",
          { "lg:hidden": !isOpen }
        )}
      >
        <div className="h-full overflow-y-auto scrollbar-thin px-3 py-4">
          {isAdmin ? (
            // Admin Navigation
            <>
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dashboard
              </p>
              
              <nav className="mt-3 space-y-1">
                {adminNavItems.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary-100 text-primary-800 py-0.5 px-2 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
              
              <p className="mt-8 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Content Management
              </p>
              
              <nav className="mt-3 space-y-1">
                {adminContentItems.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </>
          ) : (
            // Client Navigation
            <nav className="space-y-1">
              {clientNavItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 w-64 fixed inset-y-0 pt-16 z-20 transition-transform duration-300 ease-in-out transform lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full overflow-y-auto scrollbar-thin px-3 py-4">
          {isAdmin ? (
            // Admin Navigation (Mobile)
            <>
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dashboard
              </p>
              
              <nav className="mt-3 space-y-1">
                {adminNavItems.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary-100 text-primary-800 py-0.5 px-2 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
              
              <p className="mt-8 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Content Management
              </p>
              
              <nav className="mt-3 space-y-1">
                {adminContentItems.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </>
          ) : (
            // Client Navigation (Mobile)
            <nav className="space-y-1">
              {clientNavItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </aside>
    </>
  );
}
