import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

export interface ProjectDetails {
  id: number;
  name: string;
  description: string | null;
  clientId: number;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  budget: number | null;
  progress: number;
  freshbooksId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStatusProps {
  project: ProjectDetails;
  onViewDetails?: (projectId: number) => void;
}

export default function ProjectStatus({ project, onViewDetails }: ProjectStatusProps) {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not set";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  // Get status text with color
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
      case "in progress":
        return <span className="text-green-600">In Progress</span>;
      case "planning":
        return <span className="text-yellow-600">Planning</span>;
      case "on_hold":
      case "on hold":
        return <span className="text-blue-600">On Hold</span>;
      case "completed":
        return <span className="text-gray-600">Completed</span>;
      default:
        return <span>{status}</span>;
    }
  };
  
  return (
    <div className={project.id !== 1 ? "border-t border-gray-200 pt-6" : ""}>
      <h4 className="text-base font-medium text-gray-900 mb-2">{project.name}</h4>
      {project.description && (
        <p className="text-sm text-gray-500 mb-3">{project.description}</p>
      )}
      <div className="mb-1 flex justify-between">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
      </div>
      <Progress value={project.progress} className="h-2.5 mb-3" />
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Start Date</p>
          <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Due Date</p>
          <p className="text-sm font-medium">{formatDate(project.dueDate)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Status</p>
          <p className="text-sm font-medium">{getStatusText(project.status)}</p>
        </div>
      </div>
      <div className="mt-4">
        <Button 
          variant="link" 
          className="text-primary-600 hover:text-primary-700 p-0"
          onClick={() => onViewDetails && onViewDetails(project.id)}
        >
          View project details
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
