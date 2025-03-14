import { useQuery } from "@tanstack/react-query";
import {
  FileTextIcon,
  UserPlusIcon,
  CheckSquareIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

const ActivityItem = ({ icon, title, description, time }: ActivityItemProps) => (
  <div className="p-4 hover:bg-secondary-50">
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-secondary-800">{title}</p>
          <p className="text-xs text-secondary-500">{time}</p>
        </div>
        <p className="text-sm text-secondary-600 mt-1">{description}</p>
      </div>
    </div>
  </div>
);

export default function RecentActivity({ activities = [] }: { activities?: any[] }) {
  // If no activities are passed, use sample data (only for development)
  const activityData = activities.length > 0 ? activities : [
    {
      id: 1,
      type: "invoice_paid",
      title: "Invoice #INV-2022-004 was paid",
      description: "TechCorp Inc. paid $4,250.00 for Website Redesign Project",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "client_created",
      title: "New client account created",
      description: "GlobalTech Solutions was added as a new client",
      time: "1 day ago"
    },
    {
      id: 3,
      type: "project_milestone",
      title: "Project milestone completed",
      description: "Database migration completed for InnovateNow CRM project",
      time: "2 days ago"
    }
  ];

  // Icons for different activity types
  const getIcon = (type: string) => {
    switch (type) {
      case "invoice_paid":
        return <FileTextIcon size={16} />;
      case "client_created":
        return <UserPlusIcon size={16} />;
      case "project_milestone":
        return <CheckSquareIcon size={16} />;
      default:
        return <FileTextIcon size={16} />;
    }
  };
  
  // Format time (e.g. "2 hours ago")
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-secondary-200">
          {activityData.slice(0, 5).map((activity) => (
            <ActivityItem
              key={activity.id}
              icon={getIcon(activity.type || 'default')}
              title={activity.title || activity.action || 'Activity'}
              description={activity.description || activity.details || ''}
              time={activity.time || (activity.createdAt ? formatTime(activity.createdAt) : '')}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
