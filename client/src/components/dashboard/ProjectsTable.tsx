import { Link } from "wouter";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { 
  Code,
  Smartphone,
  Database,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  clientId: number;
  clientName?: string;
  contactPerson?: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  budget: number | null;
  progress: number;
  freshbooksId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsTableProps {
  projects: Project[];
  title?: string;
  viewAllLink?: string;
  onViewAll?: () => void;
  onView?: (projectId: number) => void;
  onEdit?: (projectId: number) => void;
}

export default function ProjectsTable({
  projects,
  title = "Recent Projects",
  viewAllLink,
  onViewAll,
  onView,
  onEdit
}: ProjectsTableProps) {
  // Get project icon based on name/description
  const getProjectIcon = (project: Project) => {
    const name = project.name.toLowerCase();
    const description = (project.description || "").toLowerCase();
    
    if (name.includes("web") || name.includes("website") || description.includes("web")) {
      return <Code className="text-primary dark:text-primary-foreground" />;
    } else if (name.includes("mobile") || name.includes("app") || description.includes("mobile")) {
      return <Smartphone className="text-indigo-600 dark:text-indigo-400" />;
    } else if (name.includes("data") || name.includes("migration") || description.includes("database")) {
      return <Database className="text-purple-600 dark:text-purple-400" />;
    }
    
    return <Code className="text-primary dark:text-primary-foreground" />;
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
      case "in progress":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900">In Progress</Badge>;
      case "planning":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900">Planning</Badge>;
      case "on_hold":
      case "on hold":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">On Hold</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="bg-card shadow rounded-lg border border-border">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-lg leading-6 font-medium text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        {projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No projects found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary/10 dark:bg-primary/20 rounded-md flex items-center justify-center">
                        {getProjectIcon(project)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">{project.name}</div>
                        <div className="text-sm text-muted-foreground">#{`PRJ-${project.id.toString().padStart(5, '0')}`}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{project.clientName || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{project.contactPerson || "N/A"}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(project.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(project.dueDate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatCurrency(project.budget)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="link" 
                        className="text-primary hover:text-primary/80"
                        onClick={() => onView && onView(project.id)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="link" 
                        className="text-primary hover:text-primary/80"
                        onClick={() => onEdit && onEdit(project.id)}
                      >
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                          <DropdownMenuItem>Put on Hold</DropdownMenuItem>
                          <DropdownMenuItem>Add Document</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {viewAllLink && (
        <div className="bg-muted/30 dark:bg-muted/20 px-5 py-3 border-t border-border">
          <div className="text-sm">
            <a 
              href={viewAllLink}
              onClick={(e) => {
                if (onViewAll) {
                  e.preventDefault();
                  onViewAll();
                }
              }}
              className="font-medium text-primary hover:text-primary/80"
            >
              View all projects <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
