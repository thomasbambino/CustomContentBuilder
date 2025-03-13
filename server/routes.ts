import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertClientSchema, 
  insertProjectSchema,
  insertInquirySchema,
  insertDocumentSchema,
  insertContentSchema,
  InsertInquiry
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Auth middleware to ensure user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Role middleware to ensure user has specific role
const hasRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === role) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Insufficient permissions" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Handler for zod validation errors
  const validateRequest = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  };

  // Public routes
  app.post("/api/inquiries", validateRequest(insertInquirySchema), async (req, res, next) => {
    try {
      const inquiry = await storage.createInquiry(req.body as InsertInquiry);
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Inquiry Submitted",
        details: `New inquiry from ${inquiry.name}`,
        entityType: "inquiry",
        entityId: inquiry.id
      });
      
      res.status(201).json(inquiry);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/content/:type", async (req, res, next) => {
    try {
      const { type } = req.params;
      const contents = await storage.getContentByType(type);
      res.json(contents);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/settings/public", async (req, res, next) => {
    try {
      const settings = await storage.getSettings();
      
      // Only return public settings
      const publicSettings = settings ? {
        companyName: settings.companyName,
        logoPath: settings.logoPath,
        primaryColor: settings.primaryColor,
        theme: settings.theme,
        radius: settings.radius,
        siteTitle: settings.siteTitle,
        siteDescription: settings.siteDescription,
        favicon: settings.favicon
      } : null;
      
      res.json(publicSettings);
    } catch (error) {
      next(error);
    }
  });

  // Dashboard data
  app.get("/api/dashboard/admin", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const clients = await storage.getAllClients();
      const projects = await storage.getAllProjects();
      const invoices = await storage.getAllInvoices();
      const pendingInquiries = await storage.getPendingInquiries();
      const recentActivities = await storage.getRecentActivities(10);
      
      // Calculate stats
      const activeProjects = projects.filter(p => p.status === "in_progress").length;
      const totalClients = clients.length;
      
      // Calculate outstanding invoices
      const outstandingInvoices = invoices
        .filter(i => i.status === "pending" || i.status === "overdue")
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
      
      const newInquiriesCount = pendingInquiries.length;
      
      res.json({
        stats: {
          activeProjects,
          totalClients,
          outstandingInvoices,
          newInquiriesCount
        },
        recentActivities,
        pendingInquiries,
        recentProjects: projects.slice(0, 5)
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/dashboard/client", isAuthenticated, async (req, res, next) => {
    try {
      // Get client associated with the current user
      const client = await storage.getClientByUserId(req.user?.id as number);
      
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }
      
      // Get client projects, invoices, and documents
      const projects = await storage.getProjectsByClientId(client.id);
      const invoices = await storage.getInvoicesByClientId(client.id);
      const documents = await storage.getDocumentsByClientId(client.id);
      
      res.json({
        client,
        projects,
        invoices,
        documents
      });
    } catch (error) {
      next(error);
    }
  });

  // Client routes
  app.get("/api/clients", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/clients", isAuthenticated, hasRole("admin"), validateRequest(insertClientSchema), async (req, res, next) => {
    try {
      const client = await storage.createClient(req.body);
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Client Created",
        details: `New client created: ${client.name}`,
        entityType: "client",
        entityId: client.id
      });
      
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/clients/:id", isAuthenticated, async (req, res, next) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user is admin or the client is associated with the user
      if (req.user?.role !== "admin" && client.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this client" });
      }
      
      res.json(client);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/clients/:id", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const clientId = parseInt(req.params.id);
      const updatedClient = await storage.updateClient(clientId, req.body);
      
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Client Updated",
        details: `Client ${updatedClient.name} updated`,
        entityType: "client",
        entityId: updatedClient.id
      });
      
      res.json(updatedClient);
    } catch (error) {
      next(error);
    }
  });

  // Project routes
  app.get("/api/projects", isAuthenticated, async (req, res, next) => {
    try {
      // If admin, return all projects, else return only client's projects
      if (req.user?.role === "admin") {
        const projects = await storage.getAllProjects();
        return res.json(projects);
      }
      
      // For client users, find their client record and get projects
      const client = await storage.getClientByUserId(req.user?.id as number);
      
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }
      
      const projects = await storage.getProjectsByClientId(client.id);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/projects", isAuthenticated, hasRole("admin"), validateRequest(insertProjectSchema), async (req, res, next) => {
    try {
      const project = await storage.createProject(req.body);
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Project Created",
        details: `New project created: ${project.name}`,
        entityType: "project",
        entityId: project.id
      });
      
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If user is not admin, check if the project belongs to their client
      if (req.user?.role !== "admin") {
        const client = await storage.getClientByUserId(req.user?.id as number);
        
        if (!client || project.clientId !== client.id) {
          return res.status(403).json({ message: "Forbidden: You don't have access to this project" });
        }
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/projects/:id", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id);
      const updatedProject = await storage.updateProject(projectId, req.body);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Project Updated",
        details: `Project ${updatedProject.name} updated`,
        entityType: "project",
        entityId: updatedProject.id
      });
      
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req, res, next) => {
    try {
      // If admin, return all invoices, else return only client's invoices
      if (req.user?.role === "admin") {
        const invoices = await storage.getAllInvoices();
        return res.json(invoices);
      }
      
      // For client users, find their client record and get invoices
      const client = await storage.getClientByUserId(req.user?.id as number);
      
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }
      
      const invoices = await storage.getInvoicesByClientId(client.id);
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/projects/:id/invoices", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If user is not admin, check if the project belongs to their client
      if (req.user?.role !== "admin") {
        const client = await storage.getClientByUserId(req.user?.id as number);
        
        if (!client || project.clientId !== client.id) {
          return res.status(403).json({ message: "Forbidden: You don't have access to this project" });
        }
      }
      
      const invoices = await storage.getInvoicesByProjectId(projectId);
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  });

  // Document routes
  app.get("/api/documents", isAuthenticated, async (req, res, next) => {
    try {
      // If admin, return all documents, else return only client's documents
      if (req.user?.role === "admin") {
        const documents = await storage.getAllDocuments();
        return res.json(documents);
      }
      
      // For client users, find their client record and get documents
      const client = await storage.getClientByUserId(req.user?.id as number);
      
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }
      
      const documents = await storage.getDocumentsByClientId(client.id);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/documents", isAuthenticated, validateRequest(insertDocumentSchema), async (req, res, next) => {
    try {
      // If not admin, ensure document is associated with user's client
      if (req.user?.role !== "admin") {
        const client = await storage.getClientByUserId(req.user?.id as number);
        
        if (!client) {
          return res.status(404).json({ message: "Client profile not found" });
        }
        
        // Ensure document is for user's client
        if (req.body.clientId && req.body.clientId !== client.id) {
          return res.status(403).json({ message: "Forbidden: You can only upload documents for your own account" });
        }
        
        // Set client ID if not provided
        if (!req.body.clientId) {
          req.body.clientId = client.id;
        }
      }
      
      const document = await storage.createDocument({
        ...req.body,
        uploadedBy: req.user?.id
      });
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Document Uploaded",
        details: `New document uploaded: ${document.name}`,
        entityType: "document",
        entityId: document.id
      });
      
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/documents/:id", isAuthenticated, async (req, res, next) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check permissions
      if (req.user?.role !== "admin" && document.uploadedBy !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to delete this document" });
      }
      
      const deleted = await storage.deleteDocument(documentId);
      
      if (deleted) {
        await storage.createActivity({
          userId: req.user?.id,
          action: "Document Deleted",
          details: `Document deleted: ${document.name}`,
          entityType: "document",
          entityId: document.id
        });
        
        return res.status(204).send();
      }
      
      res.status(500).json({ message: "Failed to delete document" });
    } catch (error) {
      next(error);
    }
  });

  // Inquiry routes
  app.get("/api/inquiries", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/inquiries/pending", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const pendingInquiries = await storage.getPendingInquiries();
      res.json(pendingInquiries);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/inquiries/:id", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const inquiryId = parseInt(req.params.id);
      const updatedInquiry = await storage.updateInquiry(inquiryId, req.body);
      
      if (!updatedInquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Inquiry Updated",
        details: `Inquiry status changed to ${updatedInquiry.status}`,
        entityType: "inquiry",
        entityId: updatedInquiry.id
      });
      
      res.json(updatedInquiry);
    } catch (error) {
      next(error);
    }
  });

  // Content management routes
  app.get("/api/contents", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const contents = await storage.getAllContents();
      res.json(contents);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/contents", isAuthenticated, hasRole("admin"), validateRequest(insertContentSchema), async (req, res, next) => {
    try {
      const content = await storage.createContent(req.body);
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Content Created",
        details: `New content created: ${content.title || content.type}`,
        entityType: "content",
        entityId: content.id
      });
      
      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/contents/:id", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const contentId = parseInt(req.params.id);
      const updatedContent = await storage.updateContent(contentId, req.body);
      
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      await storage.createActivity({
        userId: req.user?.id,
        action: "Content Updated",
        details: `Content updated: ${updatedContent.title || updatedContent.type}`,
        entityType: "content",
        entityId: updatedContent.id
      });
      
      res.json(updatedContent);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/contents/:id", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const deleted = await storage.deleteContent(contentId);
      
      if (deleted) {
        await storage.createActivity({
          userId: req.user?.id,
          action: "Content Deleted",
          details: `Content deleted: ${content.title || content.type}`,
          entityType: "content",
          entityId: content.id
        });
        
        return res.status(204).send();
      }
      
      res.status(500).json({ message: "Failed to delete content" });
    } catch (error) {
      next(error);
    }
  });

  // Settings routes
  app.get("/api/settings", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/settings", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const updatedSettings = await storage.updateSettings(req.body);
      
      if (updatedSettings) {
        await storage.createActivity({
          userId: req.user?.id,
          action: "Settings Updated",
          details: "System settings were updated",
          entityType: "settings",
          entityId: updatedSettings.id
        });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      next(error);
    }
  });

  // Activity routes
  app.get("/api/activities", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });

  // Freshbooks API connection routes
  app.get("/api/api-connections/freshbooks", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const connection = await storage.getApiConnection("freshbooks");
      res.json(connection);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/api-connections/freshbooks", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const updatedConnection = await storage.updateApiConnection("freshbooks", {
        provider: "freshbooks",
        ...req.body
      });
      
      if (updatedConnection) {
        await storage.createActivity({
          userId: req.user?.id,
          action: "API Connection Updated",
          details: "Freshbooks API connection was updated",
          entityType: "api_connection",
          entityId: updatedConnection.id
        });
      }
      
      res.json(updatedConnection);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
