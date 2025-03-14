import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/admin-layout";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import PendingInquiries from "@/components/dashboard/pending-inquiries";
import { useAuth } from "@/hooks/use-auth";
import { Activity } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch overview data for dashboard
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: pendingInquiries } = useQuery({
    queryKey: ["/api/inquiries/pending"],
  });

  // Get recent activities - limit to 5 for dashboard
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch(`/api/activities?limit=5`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Overview Cards */}
        <StatsCards 
          clientCount={clients?.length || 0}
          projectCount={projects?.length || 0}
          invoiceData={invoices || []}
          inquiryCount={pendingInquiries?.length || 0}
        />
        
        {/* Recent Activity */}
        <RecentActivity activities={activities || []} />
        
        {/* Pending Inquiries */}
        <PendingInquiries inquiries={pendingInquiries || []} />
      </div>
    </AdminLayout>
  );
}
