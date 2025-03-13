import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/admin-layout";
import { Invoice, Client, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { FileText, Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InvoicesPage() {
  // Fetch invoices data
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Fetch clients for reference
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Fetch projects for reference
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects?.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Invoice status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'destructive';
      default: return 'default';
    }
  };

  // View invoice details (placeholder)
  const viewInvoice = (invoice: Invoice) => {
    // This would open a detailed view or dialog
    console.log("View invoice:", invoice);
  };

  // Download invoice (placeholder)
  const downloadInvoice = (invoice: Invoice) => {
    // This would download the invoice
    console.log("Download invoice:", invoice);
  };

  // Freshbooks sync button (placeholder)
  const syncWithFreshbooks = () => {
    // This would trigger a sync with Freshbooks
    console.log("Syncing with Freshbooks...");
  };

  return (
    <AdminLayout title="Invoices">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Invoice Management</h2>
          <Button onClick={syncWithFreshbooks}>
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 01-9 9M3 12a9 9 0 019-9" />
              <path d="M21 12a9 9 0 00-9 9M3 12a9 9 0 019-9" />
            </svg>
            Sync with Freshbooks
          </Button>
        </div>

        {/* Invoice Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${invoices?.filter(inv => inv.status.toLowerCase() === 'pending')
                  .reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "")), 0)
                  .toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500">Overdue Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices?.filter(inv => inv.status.toLowerCase() === 'overdue').length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice List */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : invoices && invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientId ? getClientName(invoice.clientId) : "—"}</TableCell>
                      <TableCell>{invoice.projectId ? getProjectName(invoice.projectId) : "—"}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        {invoice.issueDate ? format(new Date(invoice.issueDate), 'MMM d, yyyy') : "—"}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status) as any}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadInvoice(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No invoices yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Invoices will appear here once synced from Freshbooks.
                </p>
                <Button className="mt-4" onClick={syncWithFreshbooks}>
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 01-9 9M3 12a9 9 0 019-9" />
                    <path d="M21 12a9 9 0 00-9 9M3 12a9 9 0 019-9" />
                  </svg>
                  Sync with Freshbooks
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
