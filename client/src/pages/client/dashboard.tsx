import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import ProjectStatus from "@/components/dashboard/ProjectStatus";
import InvoicesTable, { Invoice } from "@/components/dashboard/InvoicesTable";
import DocumentsList, { Document } from "@/components/dashboard/DocumentsList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientData {
  client: {
    id: number;
    name: string;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    userId: number | null;
    freshbooksId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  projects: {
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
  }[];
  invoices: Invoice[];
  documents: Document[];
}

export default function ClientDashboard() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch client data
  const { data, isLoading, isError, refetch } = useQuery<ClientData>({
    queryKey: ['/api/dashboard/client'],
  });

  // Navigation handlers
  const navigateToProjects = () => navigate("/client/projects");
  const navigateToInvoices = () => navigate("/client/invoices");
  const navigateToDocuments = () => navigate("/client/documents");
  const navigateToMessages = () => navigate("/client/messages");
  const navigateToProjectDetails = (projectId: number) => navigate(`/client/projects/${projectId}`);

  // Handle document download
  const handleDocumentDownload = (document: Document) => {
    // In a real implementation, this would trigger an API call to download the file
    toast({
      title: "Download started",
      description: `Downloading ${document.name}...`,
    });
    
    // Simulate download with window.open to document path
    // In a real implementation, this would be a proper API endpoint
    window.open(document.path, '_blank');
  };

  return (
    <AppLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Dashboard
            </h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={navigateToMessages} className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Loading your dashboard...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">Error loading your dashboard</p>
            <p className="mt-1 text-sm text-gray-500">Please try refreshing the page</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Project Status */}
            <Card className="bg-white shadow rounded-lg mb-6">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Project Status</h3>
              </div>
              <div className="p-5">
                {data.projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No active projects</p>
                  </div>
                ) : (
                  data.projects.map((project, index) => (
                    <ProjectStatus
                      key={project.id}
                      project={project}
                      onViewDetails={navigateToProjectDetails}
                    />
                  ))
                )}
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a 
                    href="#" 
                    className="font-medium text-primary-600 hover:text-primary-500"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToProjects();
                    }}
                  >
                    View all projects
                  </a>
                </div>
              </div>
            </Card>

            {/* Recent Invoices */}
            <div className="mb-6">
              <InvoicesTable 
                invoices={data.invoices}
                onView={(id) => navigate(`/client/invoices/${id}`)}
                viewAllLink="/client/invoices"
                onViewAll={navigateToInvoices}
              />
            </div>

            {/* Project Documents */}
            <DocumentsList 
              documents={data.documents}
              onDownload={handleDocumentDownload}
              viewAllLink="/client/documents"
              onViewAll={navigateToDocuments}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
