import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Inquiry } from "@/components/dashboard/InquiriesList";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  UserPlus
} from "lucide-react";

export default function InquiriesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Fetch inquiries
  const { data: inquiries = [], isLoading, refetch } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  // Update inquiry status mutation
  const updateInquiryStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest('PUT', `/api/inquiries/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      toast({
        title: "Inquiry updated",
        description: "Inquiry status has been updated successfully.",
      });
      setIsViewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Create client from inquiry mutation (for demo purposes)
  const createClientFromInquiryMutation = useMutation({
    mutationFn: async (inquiry: Inquiry) => {
      // First, create the client
      const clientRes = await apiRequest('POST', '/api/clients', {
        name: inquiry.name,
        contactPerson: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        notes: inquiry.message
      });
      
      const client = await clientRes.json();
      
      // Then update the inquiry status
      await apiRequest('PUT', `/api/inquiries/${inquiry.id}`, { 
        status: 'approved' 
      });
      
      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client created",
        description: "New client has been created from the inquiry.",
      });
      setIsViewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Client creation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle view inquiry details
  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewDialogOpen(true);
  };

  // Handle approve inquiry
  const handleApproveInquiry = (inquiryId: number) => {
    updateInquiryStatusMutation.mutate({ id: inquiryId, status: "approved" });
  };

  // Handle reject inquiry
  const handleRejectInquiry = (inquiryId: number) => {
    updateInquiryStatusMutation.mutate({ id: inquiryId, status: "rejected" });
  };

  // Handle create client from inquiry
  const handleCreateClient = (inquiry: Inquiry) => {
    createClientFromInquiryMutation.mutate(inquiry);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter inquiries based on active tab, search query, and status filter
  const filteredInquiries = inquiries.filter(inquiry => {
    // Filter by tab
    if (activeTab === "pending" && inquiry.status !== "pending") return false;
    if (activeTab === "approved" && inquiry.status !== "approved") return false;
    if (activeTab === "rejected" && inquiry.status !== "rejected") return false;

    // Filter by search
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inquiry.message && inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()));
      
    // Filter by status
    const matchesStatus = !statusFilter || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Count inquiries by status
  const pendingCount = inquiries.filter(i => i.status === "pending").length;
  const approvedCount = inquiries.filter(i => i.status === "approved").length;
  const rejectedCount = inquiries.filter(i => i.status === "rejected").length;

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Inquiries
            </h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              className="flex items-center"
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                All
                <Badge className="ml-2 bg-gray-100 text-gray-800">{inquiries.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingCount > 0 && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="relative">
                Approved
                {approvedCount > 0 && (
                  <Badge className="ml-2 bg-green-100 text-green-800">{approvedCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="relative">
                Rejected
                {rejectedCount > 0 && (
                  <Badge className="ml-2 bg-red-100 text-red-800">{rejectedCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              <div className="relative w-60">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search inquiries..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Loading inquiries...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No inquiries</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? "No inquiries match your search" : "No inquiries to display at this time"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInquiries.map((inquiry) => (
                  <Card key={inquiry.id} className={inquiry.status === 'pending' ? 'border-yellow-300' : undefined}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {inquiry.name}
                          </CardTitle>
                          <CardDescription>
                            {formatTimeAgo(inquiry.createdAt)}
                          </CardDescription>
                        </div>
                        <div>{getStatusBadge(inquiry.status)}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{inquiry.phone}</span>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-3">{inquiry.message}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}>
                        View Details
                      </Button>
                      
                      {inquiry.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectInquiry(inquiry.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveInquiry(inquiry.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Inquiry Details Dialog */}
        {selectedInquiry && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Inquiry Details</DialogTitle>
                <DialogDescription>
                  Submitted {formatTimeAgo(selectedInquiry.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedInquiry.name}</h3>
                      <p className="text-gray-500">{getStatusBadge(selectedInquiry.status)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <p>{selectedInquiry.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <p>{selectedInquiry.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Submission Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <p>{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Message</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-line">{selectedInquiry.message}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between items-center">
                {selectedInquiry.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleRejectInquiry(selectedInquiry.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Inquiry
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleApproveInquiry(selectedInquiry.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleCreateClient(selectedInquiry)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Client
                      </Button>
                    </div>
                  </>
                )}
                
                {selectedInquiry.status === 'approved' && (
                  <Button 
                    onClick={() => handleCreateClient(selectedInquiry)}
                    className="ml-auto"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Client
                  </Button>
                )}
                
                {selectedInquiry.status === 'rejected' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleApproveInquiry(selectedInquiry.id)}
                    className="ml-auto"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Instead
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
