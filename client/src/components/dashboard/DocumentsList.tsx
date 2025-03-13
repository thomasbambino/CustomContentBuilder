import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Download
} from "lucide-react";

export interface Document {
  id: number;
  name: string;
  path: string;
  type: string | null;
  size: number | null;
  projectId: number | null;
  projectName?: string;
  clientId: number | null;
  uploadedBy: number | null;
  uploaderName?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsListProps {
  documents: Document[];
  title?: string;
  viewAllLink?: string;
  onViewAll?: () => void;
  onDownload?: (document: Document) => void;
}

export default function DocumentsList({
  documents,
  title = "Project Documents",
  viewAllLink,
  onViewAll,
  onDownload
}: DocumentsListProps) {
  // Get document icon based on type
  const getDocumentIcon = (document: Document) => {
    const fileName = document.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return <FileText className="text-red-600 text-xl" />;
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      return <FileSpreadsheet className="text-green-600 text-xl" />;
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.svg')) {
      return <FileImage className="text-purple-600 text-xl" />;
    } else {
      return <FileText className="text-blue-600 text-xl" />;
    }
  };
  
  // Format uploaded date
  const formatUploadedDate = (dateString: string) => {
    return `Uploaded on ${format(new Date(dateString), "MMMM d, yyyy")}`;
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-5">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No documents found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map((document) => (
              <li key={document.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                    {getDocumentIcon(document)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{document.name}</p>
                    <p className="text-xs text-gray-500">{formatUploadedDate(document.createdAt)}</p>
                    {document.projectName && (
                      <p className="text-xs text-gray-500">Project: {document.projectName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-primary-600 hover:text-primary-900"
                    onClick={() => onDownload && onDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {viewAllLink && (
          <div className="mt-6">
            <a 
              href={viewAllLink}
              onClick={(e) => {
                if (onViewAll) {
                  e.preventDefault();
                  onViewAll();
                }
              }}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all documents <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
