import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileText, 
  Inbox, 
  ShieldCheck, 
  Edit, 
  Settings,
  Bell,
  Menu,
  X,
  User
} from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { companyName, logoUrl } = useTheme();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />
    },
    {
      name: "Clients",
      path: "/admin/clients",
      icon: <Users className="mr-3 h-5 w-5" />
    },
    {
      name: "Projects",
      path: "/admin/projects",
      icon: <FolderKanban className="mr-3 h-5 w-5" />
    },
    {
      name: "Invoices",
      path: "/admin/invoices",
      icon: <FileText className="mr-3 h-5 w-5" />
    },
    {
      name: "Inquiries",
      path: "/admin/inquiries",
      icon: <Inbox className="mr-3 h-5 w-5" />
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <ShieldCheck className="mr-3 h-5 w-5" />
    },
    {
      name: "Content",
      path: "/admin/content",
      icon: <Edit className="mr-3 h-5 w-5" />
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="mr-3 h-5 w-5" />
    },
    {
      name: "My Profile",
      path: "/admin/profile",
      icon: <User className="mr-3 h-5 w-5" />
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar */}
      <div 
        className={cn(
          "w-64 bg-white shadow-md z-30 border-r border-secondary-200 transition-all",
          isMobile && !sidebarOpen ? "-ml-64" : "ml-0",
          isMobile && "fixed h-full"
        )}
      >
        <div className="px-6 pt-8 pb-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            {logoUrl ? (
              <img src={logoUrl} className="h-8 w-8 rounded" alt={companyName} />
            ) : (
              <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {companyName.substring(0, 1)}
              </div>
            )}
            <span className="text-primary font-bold text-lg">{companyName}</span>
            
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="ml-auto"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <nav className="px-4 py-4">
          <div className="space-y-1">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={closeSidebar}
              >
                <a 
                  className={cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md group",
                    location === item.path
                      ? "bg-primary-50 text-primary" 
                      : "text-secondary-700 hover:bg-secondary-50 hover:text-primary"
                  )}
                >
                  {item.icon}
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden",
        isMobile && "w-full"
      )}>
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10 border-b border-secondary-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar} 
                  className="mr-3"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-2xl font-semibold text-secondary-800">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-secondary-500" />
              </Button>
              
              <div className="relative flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" alt={user?.name || user?.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user?.name || user?.username || '')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-secondary-700 hidden md:block">
                  {user?.name || user?.username}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-secondary-50 p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
