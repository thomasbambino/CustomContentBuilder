import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface InquiriesListProps {
  inquiries: Inquiry[];
  title?: string;
  onApprove?: (inquiryId: number) => void;
  onViewDetails?: (inquiry: Inquiry) => void;
  onViewAll?: () => void;
  viewAllLink?: string;
}

export default function InquiriesList({
  inquiries,
  title = "Pending Inquiries",
  onApprove,
  onViewDetails,
  onViewAll,
  viewAllLink
}: InquiriesListProps) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Format submission time
  const formatSubmissionTime = (dateString: string) => {
    const date = new Date(dateString);
    return `Submitted ${format(date, "MMMM d, yyyy 'at' h:mm a")}`;
  };
  
  return (
    <div className="bg-card shadow rounded-lg h-full border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg leading-6 font-medium text-foreground">{title}</h3>
        {inquiries.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            {inquiries.length} new
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="overflow-hidden">
          {inquiries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No pending inquiries</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id} className="py-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span>{getInitials(inquiry.name)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {inquiry.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {inquiry.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatSubmissionTime(inquiry.createdAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                        onClick={() => onApprove && onApprove(inquiry.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(inquiry)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {}}>
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {}}>
                            Mark as Spam
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
              View all inquiries <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
