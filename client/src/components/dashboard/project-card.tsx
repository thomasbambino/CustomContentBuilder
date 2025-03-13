import { ArrowRightIcon } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, DollarSignIcon } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    description: string;
    status: string;
    progress: number;
    dueDate: string | null;
    budget: string | null;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Format date to readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-800">{project.name}</h3>
          <Badge variant="outline" className={getStatusColor(project.status)}>
            {formatStatus(project.status)}
          </Badge>
        </div>
        
        <p className="text-secondary-600 text-sm mb-4">
          {project.description || "No description available."}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-secondary-700">Progress</span>
            <span className="text-sm font-medium text-secondary-700">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        <div className="flex flex-wrap justify-between text-sm text-secondary-500 mb-4 gap-y-2">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Due: {formatDate(project.dueDate)}</span>
          </div>
          {project.budget && (
            <div className="flex items-center">
              <DollarSignIcon className="h-4 w-4 mr-1" />
              <span>Budget: {project.budget}</span>
            </div>
          )}
        </div>
        
        <Link href={`/client/projects/${project.id}`}>
          <a className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm">
            View project details
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardContent>
    </Card>
  );
}
