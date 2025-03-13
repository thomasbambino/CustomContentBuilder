import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";

interface ClientHeaderProps {
  title: string;
}

export default function ClientHeader({ title }: ClientHeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [notifications] = useState([
    { id: 1, text: "Project status updated: Website Redesign", time: "10 minutes ago" },
    { id: 2, text: "New document added to CRM Integration", time: "2 hours ago" },
    { id: 3, text: "Invoice #INV-2023-006 is due in 5 days", time: "1 day ago" },
  ]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userInitials = user?.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <header className="bg-white shadow-sm z-10 border-b border-secondary-200">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-semibold text-secondary-800">{title}</h1>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5 text-secondary-500" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-600"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold">Notifications</span>
                <span className="text-xs text-secondary-500">
                  {notifications.length} new
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="px-4 py-2 cursor-default">
                    <div>
                      <p className="text-sm font-medium">{notification.text}</p>
                      <p className="text-xs text-secondary-500">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                <span className="text-sm text-primary-600">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary-600 text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-secondary-700 hidden md:block">
                  {user?.fullName || "Client"}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-secondary-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/client/profile">
                  <a className="flex items-center cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
