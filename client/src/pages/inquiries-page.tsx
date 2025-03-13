import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/admin-layout";
import { Inquiry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Check, Mail, Phone, X, Eye, MessageSquare, User, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InquiriesPage() {
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch inquiries data
  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
  });
  
  // Fetch pending inquiries
  const { data: pendingInquiries } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries/pending"],
  });

  // Update inquiry status mutation
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/inquiries/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries/pending"] });
      setIsViewDialogOpen(false);
      toast({
        title: "Inquiry updated",
        description: "The inquiry status has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update inquiry",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // View inquiry details
  const viewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewDialogOpen(true);
  };

  // Approve inquiry
  const approveInquiry = (inquiry: Inquiry) => {
    updateInquiryMutation.mutate({ id: inquiry.id, status: "approved" });
  };

  // Reject inquiry
  const rejectInquiry = (inquiry: Inquiry) => {
    updateInquiryMutation.mutate({ id: inquiry.id, status: "rejected" });
  };

  // Convert inquiry to client
  const convertToClient = (inquiry: Inquiry) => {
    // This would involve creating a client from the inquiry data
    toast({
      title: "Converting to client",
      description: "This feature is not yet implemented."
    });
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <AdminLayout title="Inquiries">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Inquiry Management</h2>
        </div>

        {/* Inquiry Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500">Total Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inquiries?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500">Pending Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInquiries?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inquiries && inquiries.length > 0
                  ? `${Math.round((inquiries.filter(inq => inq.status === 'approved').length / inquiries.length) * 100)}%`
                  : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry List */}
        <Card>
          <CardHeader>
            <CardTitle>All Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : inquiries && inquiries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email/Phone</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className={inquiry.status === 'pending' ? 'bg-secondary-50' : ''}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{inquiry.company || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="text-xs">{inquiry.email}</span>
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              <span className="text-xs">{inquiry.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{inquiry.service || "General Inquiry"}</TableCell>
                      <TableCell>
                        {inquiry.createdAt ? format(new Date(inquiry.createdAt), 'MMM d, yyyy') : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(inquiry.status) as any}>
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewInquiry(inquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {inquiry.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => approveInquiry(inquiry)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => rejectInquiry(inquiry)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {inquiry.status === 'approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() => convertToClient(inquiry)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No inquiries yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  When potential clients submit inquiries, they will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Inquiry Dialog */}
      {selectedInquiry && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>
                Submitted on {selectedInquiry.createdAt 
                  ? format(new Date(selectedInquiry.createdAt), 'MMMM d, yyyy')
                  : "Unknown Date"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedInquiry.name}</h3>
                  {selectedInquiry.company && (
                    <p className="text-sm text-secondary-500">{selectedInquiry.company}</p>
                  )}
                </div>
                <Badge variant={getStatusBadgeVariant(selectedInquiry.status) as any}>
                  {selectedInquiry.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-secondary-500">Email</p>
                  <p className="text-sm break-all">{selectedInquiry.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-secondary-500">Phone</p>
                  <p className="text-sm">{selectedInquiry.phone || "—"}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-secondary-500">Service of Interest</p>
                <p className="text-sm">{selectedInquiry.service || "General Inquiry"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-secondary-500">Message</p>
                <div className="text-sm p-3 bg-secondary-50 rounded border border-secondary-100">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              {selectedInquiry.status === 'pending' ? (
                <>
                  <Button 
                    variant="outline" 
                    className="text-red-600" 
                    onClick={() => rejectInquiry(selectedInquiry)}
                    disabled={updateInquiryMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  <Button 
                    onClick={() => approveInquiry(selectedInquiry)}
                    disabled={updateInquiryMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" /> Approve
                  </Button>
                </>
              ) : selectedInquiry.status === 'approved' ? (
                <Button onClick={() => convertToClient(selectedInquiry)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Create Client
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
