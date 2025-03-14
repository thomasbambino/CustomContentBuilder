import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Project } from "@/components/dashboard/ProjectsTable";
import { Document } from "@/components/dashboard/DocumentsList";
import {
  Search,
  RefreshCw,
  ArrowRight,
  Download,
  Upload,
  Calendar,
  DollarSign,
  Check,
  Clock,
  ClipboardList,
  FileText,
  Code,
  Smartphone,
  Database
} from "lucide-react";

export default function ClientProjectsPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch client projects
  const { data: projects = [], isLoading: isProjectsLoading, refetch } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch project documents when a project is selected
  const { data: documents = [], isLoading: isDocumentsLoading } = useQuery<Document[]>({
    queryKey: [`/api/projects/${selectedProject?.id}/documents`],
    enabled: !!selectedProject,
  });

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not set";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Get project icon based on name/description
  const getProjectIcon = (project: Project) => {
    const name = project.name.toLowerCase();
    const description = (project.description || "").toLowerCase();
    
    if (name.includes("web") || name.includes("website") || description.includes("web")) {
      return <Code className="h-5 w-5 text-primary-600" />;
    } else if (name.includes("mobile") || name.includes("app") || description.includes("mobile")) {
      return <Smartphone className="h-5 w-5 text-indigo-600" />;
    } else if (name.includes("data") || name.includes("migration") || description.includes("database")) {
      return <Database className="h-5 w-5 text-purple-600" />;
    }
    
    return <Code className="h-5 w-5 text-primary-600" />;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
      case "in progress":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Progress</Badge>;
      case "planning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Planning</Badge>;
      case "on_hold":
      case "on hold":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">On Hold</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // View project details
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  };

  // Handle document download
  const handleDownloadDocument = (document: Document) => {
    toast({
      title: "Download started",
      description: `Downloading ${document.name}...`,
    });
    
    // In a real implementation, this would be a proper API endpoint
    window.open(document.path, '_blank');
  };

  // Open upload dialog
  const handleUploadDocument = (project: Project) => {
    setSelectedProject(project);
    setIsUploadDialogOpen(true);
  };

  // Handle simulated file upload
  const handleFileUpload = () => {
    toast({
      title: "File uploaded",
      description: "Your document has been uploaded successfully.",
    });
    setIsUploadDialogOpen(false);
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Projects
            </h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              className="flex items-center"
              disabled={isProjectsLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={() => navigate("/client/messages")}
              className="flex items-center"
            >
              Request New Project
            </Button>
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
                placeholder="Search projects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects List */}
          {isProjectsLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Loading your projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter 
                  ? "No projects match your search criteria" 
                  : "You don't have any projects yet"}
              </p>
              <Button 
                onClick={() => navigate("/client/messages")}
                className="mt-4"
              >
                Request Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-md bg-primary-100 flex items-center justify-center">
                        {getProjectIcon(project)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>
                          #{project.id.toString().padStart(4, '0')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description || "No description provided"}
                      </p>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
                          <span className="text-gray-600">Due {formatDate(project.dueDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-1.5" />
                          <span className="text-gray-600">{formatCurrency(project.budget)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-gray-50 mt-2">
                    {getStatusBadge(project.status)}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary"
                      onClick={() => handleViewProject(project)}
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Project Details Dialog */}
        {selectedProject && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <div className="w-8 h-8 rounded-md mr-2 bg-primary-100 flex items-center justify-center">
                    {getProjectIcon(selectedProject)}
                  </div>
                  {selectedProject.name}
                </DialogTitle>
                <DialogDescription>
                  Project #{selectedProject.id.toString().padStart(4, '0')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="text-xl font-bold">{selectedProject.progress}%</p>
                  </div>
                </div>
                
                {selectedProject.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1">{selectedProject.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p>{formatDate(selectedProject.startDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p>{formatDate(selectedProject.dueDate)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <p>{formatCurrency(selectedProject.budget)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <p>{formatDate(selectedProject.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">Project Documents</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        handleUploadDocument(selectedProject);
                      }}
                      className="text-xs h-8"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Upload
                    </Button>
                  </div>
                  
                  {isDocumentsLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                      </div>
                    </div>
                  ) : documents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No documents available</p>
                  ) : (
                    <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                      <ul className="space-y-2">
                        {documents.map(document => (
                          <li key={document.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm">{document.name}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadDocument(document)}
                              className="h-7 px-2"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => navigate("/client/messages")}
                >
                  Contact Support
                </Button>
                <Button 
                  onClick={() => navigate("/client/invoices")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoices
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Upload Document Dialog */}
        {selectedProject && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a document for {selectedProject.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-name">Document Name</Label>
                  <Input id="file-name" placeholder="Enter document name" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="file-upload">File</Label>
                  <div className="mt-1">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, XLS, JPG, PNG (MAX. 10MB)
                          </p>
                        </div>
                        <input id="file-upload" type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFileUpload}>
                  Upload Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
