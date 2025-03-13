import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckIcon, XIcon, MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function PendingInquiries() {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState<Record<number, boolean>>({});

  // Fetch pending inquiries
  const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries/pending'],
  });

  // Update inquiry status mutation
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest('PUT', `/api/inquiries/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries/pending'] });
      toast({
        title: 'Inquiry updated',
        description: 'The inquiry status has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleApprove = (id: number) => {
    updateInquiryMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: number) => {
    updateInquiryMutation.mutate({ id, status: 'rejected' });
  };

  const toggleExpand = (id: number) => {
    setIsExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Pending Inquiries</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Pending Inquiries</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CardDescription>There are no pending inquiries at this time.</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Pending Inquiries</CardTitle>
          <Button variant="link" asChild>
            <a href="/admin/inquiries">View all</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-secondary-200">
          {inquiries.slice(0, 3).map((inquiry) => (
            <div key={inquiry.id} className="p-4 hover:bg-secondary-50">
              <div className="sm:flex sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-secondary-800">
                      {inquiry.name}{inquiry.company ? ` - ${inquiry.company}` : ''}
                    </h3>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">
                      New
                    </span>
                  </div>
                  <div className={`mt-1 text-sm text-secondary-600 ${isExpanded[inquiry.id] ? '' : 'line-clamp-2'}`}>
                    {inquiry.message}
                  </div>
                  {inquiry.message.length > 120 && (
                    <button 
                      className="text-xs text-primary-600 mt-1 hover:underline"
                      onClick={() => toggleExpand(inquiry.id)}
                    >
                      {isExpanded[inquiry.id] ? 'Show less' : 'Show more'}
                    </button>
                  )}
                  <div className="mt-2 flex items-center text-xs text-secondary-500 flex-wrap gap-2">
                    <div className="flex items-center">
                      <span className="mr-1">📧</span>
                      <span>{inquiry.email}</span>
                    </div>
                    {inquiry.phone && (
                      <>
                        <span className="mx-1">•</span>
                        <div className="flex items-center">
                          <span className="mr-1">📞</span>
                          <span>{inquiry.phone}</span>
                        </div>
                      </>
                    )}
                    <span className="mx-1">•</span>
                    <div className="flex items-center">
                      <span className="mr-1">🕒</span>
                      <span>Received {formatDate(inquiry.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(inquiry.id)}
                    disabled={updateInquiryMutation.isPending}
                  >
                    <CheckIcon className="mr-1 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(inquiry.id)}
                    disabled={updateInquiryMutation.isPending}
                  >
                    <XIcon className="mr-1 h-4 w-4" /> Reject
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="px-2">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Send email</DropdownMenuItem>
                      <DropdownMenuItem>Add to calendar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
