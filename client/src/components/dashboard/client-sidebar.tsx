import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  Receipt,
  Headphones,
  UserCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

function SidebarItem({ href, icon, children, isActive }: SidebarItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-2 py-2 text-base font-medium rounded-md group",
          isActive
            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
            : "text-foreground hover:bg-muted hover:text-primary dark:hover:text-primary-foreground"
        )}
      >
        <div className={cn(
          "mr-3", 
          isActive 
            ? "text-primary dark:text-primary-foreground" 
            : "text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground"
        )}>
          {icon}
        </div>
        <span>{children}</span>
      </a>
    </Link>
  );
}

export default function ClientSidebar() {
  const [location] = useLocation();
  const { settings, isLoading } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const companyName = settings?.["company.name"] || "SD Tech Pros";
  const companyLogo = settings?.["company.logo"];

  const sidebarItems = [
    { href: "/client/dashboard", icon: <LayoutDashboard size={20} />, text: "Dashboard" },
    { href: "/client/projects", icon: <GitBranch size={20} />, text: "My Projects" },
    { href: "/client/invoices", icon: <Receipt size={20} />, text: "Invoices" },
    { href: "/client/documents", icon: <FileText size={20} />, text: "Documents" },
    { href: "/client/support", icon: <Headphones size={20} />, text: "Support" },
    { href: "/client/profile", icon: <UserCircle size={20} />, text: "My Profile" },
  ];

  return (
    <div className="w-64 bg-card shadow-md z-10 border-r border-border flex flex-col h-full">
      <div className="px-6 pt-8 pb-6 border-b border-border">
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <div className="h-8 w-8 rounded bg-muted animate-pulse"></div>
          ) : companyLogo ? (
            <img src={companyLogo} className="h-8 w-8 rounded" alt="Company Logo" />
          ) : (
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <span className="font-semibold">{companyName.charAt(0)}</span>
            </div>
          )}
          <span className="text-foreground font-bold text-lg">
            {isLoading ? (
              <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
            ) : (
              companyName
            )}
          </span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="px-4 py-4 flex-1 overflow-y-auto hidden md:block">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              isActive={location === item.href}
            >
              {item.text}
            </SidebarItem>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation Toggle */}
      <div className="border-t border-secondary-200 p-4 md:hidden">
        <button
          className="flex items-center justify-between w-full text-secondary-700 hover:text-primary-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="font-medium">Menu</span>
          {isMobileMenuOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="px-4 py-2 border-t border-secondary-200 md:hidden">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                isActive={location === item.href}
              >
                {item.text}
              </SidebarItem>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
