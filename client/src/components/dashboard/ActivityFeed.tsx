import { formatDistanceToNow } from "date-fns";
import { 
  FileUp, 
  UserPlus, 
  FileText, 
  RefreshCw,
  User,
  Briefcase
} from "lucide-react";

export interface Activity {
  id: number;
  userId: number | null;
  action: string;
  details: string | null;
  entityType: string | null;
  entityId: number | null;
  createdAt: string;
  userName?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  viewAllLink?: string;
  onViewAll?: () => void;
}

export default function ActivityFeed({ 
  activities, 
  title = "Recent Activity",
  viewAllLink,
  onViewAll
}: ActivityFeedProps) {
  // Get icon based on action or entity type
  const getActivityIcon = (activity: Activity) => {
    // Default color is gray
    let iconColor = "bg-gray-400 dark:bg-gray-600";
    let icon = <RefreshCw className="h-4 w-4 text-white" />;
    
    // Set icon based on activity type
    if (activity.action.includes("Project")) {
      iconColor = "bg-primary dark:bg-primary/80";
      icon = <Briefcase className="h-4 w-4 text-primary-foreground" />;
    } else if (activity.action.includes("Client") || activity.action.includes("User")) {
      iconColor = "bg-green-500 dark:bg-green-600";
      icon = <UserPlus className="h-4 w-4 text-white" />;
    } else if (activity.action.includes("Invoice")) {
      iconColor = "bg-yellow-500 dark:bg-yellow-600";
      icon = <FileText className="h-4 w-4 text-white" />;
    } else if (activity.action.includes("Document")) {
      iconColor = "bg-blue-500 dark:bg-blue-600";
      icon = <FileUp className="h-4 w-4 text-white" />;
    } else if (activity.action.includes("Login") || activity.action.includes("Logout")) {
      iconColor = "bg-purple-500 dark:bg-purple-600";
      icon = <User className="h-4 w-4 text-white" />;
    }
    
    return { iconColor, icon };
  };
  
  // Format time (e.g. "2 hours ago")
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  return (
    <div className="bg-card shadow rounded-lg h-full border">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-lg leading-6 font-medium text-foreground">{title}</h3>
      </div>
      <div className="p-5">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.length === 0 ? (
              <li className="py-4 text-center text-sm text-muted-foreground">
                No activity to display
              </li>
            ) : (
              activities.slice(0, 5).map((activity, index) => {
                const { iconColor, icon } = getActivityIcon(activity);
                const isLast = index === Math.min(activities.length, 5) - 1;
                
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span 
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" 
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-full ${iconColor} flex items-center justify-center ring-8 ring-card`}>
                            {icon}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <a href="#" className="font-medium text-foreground">
                                {activity.userName || "System"}
                              </a>
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {activity.details}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>{formatTime(activity.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
        {viewAllLink && (
          <div className="mt-6">
            <a 
              href={viewAllLink}
              onClick={(e) => {
                if (onViewAll) {
                  e.preventDefault();
                  onViewAll();
                }
              }}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              View all activity <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
