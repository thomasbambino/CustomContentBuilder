import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Activity } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { 
  RefreshCw, 
  UserPlus, 
  FileText, 
  FileUp, 
  User, 
  Briefcase 
} from "lucide-react";

export default function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch all activities
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities", page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/activities?limit=100`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  // Get icon based on action or entity type
  const getActivityIcon = (activity: Activity) => {
    // Default color is gray
    let iconColor = "bg-gray-400";
    let icon = <RefreshCw className="h-4 w-4 text-white" />;
    
    // Set icon based on activity type
    if (activity.action?.includes("Project")) {
      iconColor = "bg-primary-500";
      icon = <Briefcase className="h-4 w-4 text-white" />;
    } else if (activity.action?.includes("Client") || activity.action?.includes("User")) {
      iconColor = "bg-green-500";
      icon = <UserPlus className="h-4 w-4 text-white" />;
    } else if (activity.action?.includes("Invoice")) {
      iconColor = "bg-yellow-500";
      icon = <FileText className="h-4 w-4 text-white" />;
    } else if (activity.action?.includes("Document")) {
      iconColor = "bg-blue-500";
      icon = <FileUp className="h-4 w-4 text-white" />;
    } else if (activity.action?.includes("Login") || activity.action?.includes("Logout")) {
      iconColor = "bg-purple-500";
      icon = <User className="h-4 w-4 text-white" />;
    }
    
    return { iconColor, icon };
  };
  
  // Format time (e.g. "2 hours ago")
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Activity Log</h1>
        <p className="mt-2 text-gray-600">View system-wide activity and user actions</p>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>System Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="py-6 text-center">Loading activity log...</div>
            ) : activities && activities.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.map((activity, index) => {
                    const { iconColor, icon } = getActivityIcon(activity);
                    const isLast = index === activities.length - 1;
                    
                    return (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {!isLast && (
                            <span 
                              className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" 
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className={`h-10 w-10 rounded-full ${iconColor} flex items-center justify-center ring-8 ring-white`}>
                                {icon}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">
                                    {activity.userName || "System"}
                                  </span>
                                  <span className="ml-2 font-medium text-gray-500">
                                    {activity.action}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  {activity.details}
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>{formatTime(activity.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                No activity records found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}