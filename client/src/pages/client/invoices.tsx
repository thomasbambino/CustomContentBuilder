import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/components/dashboard/InvoicesTable";
import InvoicesTable from "@/components/dashboard/InvoicesTable";
import { format } from "date-fns";
import {
  Search,
  RefreshCw,
  FileText,
  Download,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail
} from "lucide-react";

export default function ClientInvoicesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch client invoices
  const { data: invoices = [], isLoading, refetch } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle view invoice details
  const handleViewInvoice = (invoiceId: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setIsViewDialogOpen(true);
    } else {
      toast({
        title: "Invoice not found",
        description: "The selected invoice could not be found.",
        variant: "destructive",
      });
    }
  };

  // Handle simulated payment process
  const handlePayInvoice = () => {
    setIsViewDialogOpen(false);
    setIsPayDialogOpen(true);
  };

  // Handle simulated payment submission
  const handleSubmitPayment = () => {
    toast({
      title: "Payment successful",
      description: "Your payment has been processed successfully.",
    });
    setIsPayDialogOpen(false);
    refetch();
  };

  // Handle download invoice
  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({
      title: "Download started",
      description: `Invoice ${invoice.invoiceNumber} is being downloaded.`,
    });
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.projectName && invoice.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.description && invoice.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get invoice statistics
  const totalPaid = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
    
  const totalPending = invoices
    .filter(inv => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);
    
  const totalOverdue = invoices
    .filter(inv => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Invoices
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

        {/* Invoice Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPending)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Overdue Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOverdue)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search invoices..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter 
                    ? "No invoices match your search criteria" 
                    : "You don't have any invoices yet"}
                </p>
              </div>
            ) : (
              <InvoicesTable 
                invoices={filteredInvoices}
                onView={handleViewInvoice}
                title="Your Invoices"
              />
            )}
          </div>
        </div>

        {/* Invoice Details Dialog */}
        {selectedInvoice && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
                <DialogDescription>
                  Invoice #{selectedInvoice.invoiceNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-xl font-bold">{formatCurrency(selectedInvoice.amount)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Project</p>
                    <p className="font-medium">{selectedInvoice.projectName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.createdAt)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p>{formatDate(selectedInvoice.dueDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>
                
                {selectedInvoice.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1">{selectedInvoice.description}</p>
                  </div>
                )}
                
                {selectedInvoice.status === "pending" && (
                  <div className="bg-yellow-50 p-3 rounded-md flex items-start">
                    <Clock className="text-yellow-500 h-5 w-5 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800">Payment Pending</p>
                      <p className="text-sm text-yellow-700">This invoice is awaiting payment.</p>
                    </div>
                  </div>
                )}
                
                {selectedInvoice.status === "overdue" && (
                  <div className="bg-red-50 p-3 rounded-md flex items-start">
                    <AlertTriangle className="text-red-500 h-5 w-5 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-red-800">Payment Overdue</p>
                      <p className="text-sm text-red-700">This invoice is past the due date.</p>
                    </div>
                  </div>
                )}
                
                {selectedInvoice.status === "paid" && (
                  <div className="bg-green-50 p-3 rounded-md flex items-start">
                    <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">Payment Complete</p>
                      <p className="text-sm text-green-700">Thank you for your payment.</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                {(selectedInvoice.status === "pending" || selectedInvoice.status === "overdue") && (
                  <Button 
                    onClick={handlePayInvoice}
                    className="flex items-center"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Invoice
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Payment Dialog */}
        {selectedInvoice && (
          <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Pay Invoice</DialogTitle>
                <DialogDescription>
                  Complete payment for invoice #{selectedInvoice.invoiceNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Amount Due:</span>
                    <span className="font-bold">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Invoice #{selectedInvoice.invoiceNumber}</span>
                    <span>Due: {formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="font-medium">Payment Information</p>
                  
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <Input id="expiration" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-md flex items-start">
                  <Mail className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-blue-800">Payment Receipt</p>
                    <p className="text-sm text-blue-700">A receipt will be sent to your email after payment.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitPayment}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Complete Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
