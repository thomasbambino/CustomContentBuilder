import { ArrowUpIcon, ArrowDownIcon, Equals } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  UsersIcon,
  GitBranchIcon,
  FileInvoiceDollarIcon,
  InboxIcon,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    isIncrease: boolean;
    isNeutral?: boolean;
  };
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-secondary-500 text-sm font-medium">{title}</h3>
          <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
            {icon}
          </span>
        </div>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-secondary-800">{value}</p>
          <p
            className={`ml-2 text-xs font-medium flex items-center ${
              change.isNeutral
                ? "text-yellow-600"
                : change.isIncrease
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {change.isNeutral ? (
              <Equals className="mr-1 h-3 w-3" />
            ) : change.isIncrease ? (
              <ArrowUpIcon className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownIcon className="mr-1 h-3 w-3" />
            )}
            <span>{change.value}%</span>
          </p>
        </div>
        <p className="text-xs text-secondary-500 mt-1">{description || "From previous month"}</p>
      </CardContent>
    </Card>
  );
}

export default function MetricsOverview() {
  // Get clients count
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Get projects count
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Get invoices count with pending status
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
  });
  const pendingInvoices = invoices.filter((invoice: any) => invoice.status === "pending");
  
  // Calculate total of pending invoices
  const pendingInvoicesTotal = pendingInvoices.reduce((total: number, invoice: any) => {
    const amount = parseFloat(invoice.amount.split(" ")[0]);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Get pending inquiries count
  const { data: pendingInquiries = [] } = useQuery({
    queryKey: ["/api/inquiries/pending"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Clients"
        value={clients.length}
        change={{ value: 8, isIncrease: true }}
        icon={<UsersIcon size={18} />}
      />
      <MetricCard
        title="Active Projects"
        value={projects.filter((p: any) => p.status === "in_progress").length}
        change={{ value: 12, isIncrease: true }}
        icon={<GitBranchIcon size={18} />}
      />
      <MetricCard
        title="Pending Invoices"
        value={`$${pendingInvoicesTotal.toFixed(2)}`}
        change={{ value: 0, isIncrease: false, isNeutral: true }}
        icon={<FileInvoiceDollarIcon size={18} />}
      />
      <MetricCard
        title="New Inquiries"
        value={pendingInquiries.length}
        change={{ value: 10, isIncrease: false }}
        icon={<InboxIcon size={18} />}
      />
    </div>
  );
}
