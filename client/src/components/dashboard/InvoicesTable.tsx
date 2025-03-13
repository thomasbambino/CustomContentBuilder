import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  projectId: number | null;
  projectName?: string;
  clientId: number;
  clientName?: string;
  amount: number;
  status: string;
  dueDate: string | null;
  description: string | null;
  freshbooksId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  title?: string;
  viewAllLink?: string;
  onViewAll?: () => void;
  onView?: (invoiceId: number) => void;
}

export default function InvoicesTable({
  invoices,
  title = "Recent Invoices",
  viewAllLink,
  onViewAll,
  onView
}: InvoicesTableProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
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
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        {invoices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No invoices found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {invoice.projectName || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <Button 
                      variant="link" 
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => onView && onView(invoice.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {viewAllLink && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a 
              href={viewAllLink}
              onClick={(e) => {
                if (onViewAll) {
                  e.preventDefault();
                  onViewAll();
                }
              }}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              View all invoices <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
