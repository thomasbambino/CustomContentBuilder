import { storage } from './storage';
import type { FreshbooksIntegration, InsertFreshbooksIntegration } from '@shared/schema';

interface FreshbooksTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface FreshbooksClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  address: {
    street: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
  };
}

interface FreshbooksProject {
  id: string;
  title: string;
  description: string;
  client_id: string;
  due_date: string;
  budget: {
    amount: string;
    currency_code: string;
  };
}

interface FreshbooksInvoice {
  id: string;
  invoice_number: string;
  client_id: string;
  project_id?: string;
  amount: {
    amount: string;
    currency_code: string;
  };
  status: string;
  create_date: string;
  due_date: string;
  payment_date?: string;
}

export class FreshbooksService {
  private static instance: FreshbooksService;
  private baseUrl = 'https://api.freshbooks.com';
  private clientId = process.env.FRESHBOOKS_CLIENT_ID || '';
  private clientSecret = process.env.FRESHBOOKS_CLIENT_SECRET || '';
  private redirectUri = process.env.FRESHBOOKS_REDIRECT_URI || '';

  private constructor() {}

  public static getInstance(): FreshbooksService {
    if (!FreshbooksService.instance) {
      FreshbooksService.instance = new FreshbooksService();
    }
    return FreshbooksService.instance;
  }

  public getAuthUrl(): string {
    const scopes = encodeURIComponent('user:profile:read project:clients:read project:projects:read invoice:read');
    return `${this.baseUrl}/auth/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scopes}`;
  }

  public async exchangeCodeForToken(code: string): Promise<FreshbooksIntegration> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code for token: ${response.statusText}`);
      }

      const data: FreshbooksTokenResponse = await response.json();
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
      
      // Get account ID from user profile
      const accountId = await this.getCurrentAccountId(data.access_token);
      
      const integrationData: InsertFreshbooksIntegration = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        accountId,
        expiresAt,
      };

      // Store the integration data
      return await storage.saveFreshbooksIntegration(integrationData);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  private async getCurrentAccountId(accessToken: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.statusText}`);
      }

      const data = await response.json();
      // Use the first account as default
      return data.response.business_memberships[0].business.account_id;
    } catch (error) {
      console.error('Error getting account ID:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<FreshbooksIntegration> {
    try {
      const integration = await storage.getFreshbooksIntegration();
      if (!integration) {
        throw new Error('No Freshbooks integration found');
      }

      const response = await fetch(`${this.baseUrl}/auth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: integration.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data: FreshbooksTokenResponse = await response.json();
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
      
      const updatedIntegration: InsertFreshbooksIntegration = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        accountId: integration.accountId,
        expiresAt,
      };

      // Store the updated integration data
      return await storage.saveFreshbooksIntegration(updatedIntegration);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const integration = await storage.getFreshbooksIntegration();
      if (!integration) {
        throw new Error('No Freshbooks integration found');
      }

      // Check if token is expired
      if (new Date() >= integration.expiresAt) {
        // Token is expired, refresh it
        const refreshedIntegration = await this.refreshAccessToken();
        return refreshedIntegration.accessToken;
      }

      return integration.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  // API methods for clients
  public async getClients(): Promise<FreshbooksClient[]> {
    try {
      const accessToken = await this.getAccessToken();
      const integration = await storage.getFreshbooksIntegration();
      
      if (!integration) {
        throw new Error('No Freshbooks integration found');
      }

      const response = await fetch(`${this.baseUrl}/accounting/account/${integration.accountId}/clients/clients`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get clients: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.result.clients;
    } catch (error) {
      console.error('Error getting clients:', error);
      throw error;
    }
  }

  // API methods for projects
  public async getProjects(): Promise<FreshbooksProject[]> {
    try {
      const accessToken = await this.getAccessToken();
      const integration = await storage.getFreshbooksIntegration();
      
      if (!integration) {
        throw new Error('No Freshbooks integration found');
      }

      const response = await fetch(`${this.baseUrl}/projects/api/v1/projects?account_id=${integration.accountId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get projects: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projects;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  // API methods for invoices
  public async getInvoices(): Promise<FreshbooksInvoice[]> {
    try {
      const accessToken = await this.getAccessToken();
      const integration = await storage.getFreshbooksIntegration();
      
      if (!integration) {
        throw new Error('No Freshbooks integration found');
      }

      const response = await fetch(`${this.baseUrl}/accounting/account/${integration.accountId}/invoices/invoices`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get invoices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.result.invoices;
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }

  // Check if Freshbooks integration is set up
  public async isConnected(): Promise<boolean> {
    try {
      const integration = await storage.getFreshbooksIntegration();
      return !!integration;
    } catch (error) {
      console.error('Error checking if connected:', error);
      return false;
    }
  }

  // Sync clients from Freshbooks to local storage
  public async syncClients(): Promise<void> {
    try {
      const clients = await this.getClients();
      
      for (const client of clients) {
        // Check if client already exists
        const existingClient = await storage.getClientByFreshbooksId(client.id);
        
        if (existingClient) {
          // Update existing client
          await storage.updateClient(existingClient.id, {
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address ? 
              `${client.address.street}, ${client.address.city}, ${client.address.province}, ${client.address.country}, ${client.address.postal_code}` : 
              undefined,
          });
        } else {
          // Create new client
          await storage.createClient({
            freshbooksId: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address ? 
              `${client.address.street}, ${client.address.city}, ${client.address.province}, ${client.address.country}, ${client.address.postal_code}` : 
              undefined,
            notes: '',
            userId: null,
          });
        }
      }
    } catch (error) {
      console.error('Error syncing clients:', error);
      throw error;
    }
  }

  // Sync projects from Freshbooks to local storage
  public async syncProjects(): Promise<void> {
    try {
      const projects = await this.getProjects();
      
      for (const project of projects) {
        // Check if client exists
        const client = await storage.getClientByFreshbooksId(project.client_id);
        
        if (!client) {
          // Skip if client doesn't exist
          continue;
        }
        
        // Check if project already exists
        const existingProject = await this.getProjectByFreshbooksId(project.id);
        
        if (existingProject) {
          // Update existing project
          await storage.updateProject(existingProject.id, {
            name: project.title,
            description: project.description,
            budget: project.budget?.amount ? `${project.budget.amount} ${project.budget.currency_code}` : undefined,
            dueDate: project.due_date ? new Date(project.due_date) : undefined,
          });
        } else {
          // Create new project
          await storage.createProject({
            freshbooksId: project.id,
            clientId: client.id,
            name: project.title,
            description: project.description,
            budget: project.budget?.amount ? `${project.budget.amount} ${project.budget.currency_code}` : undefined,
            status: 'in_progress',
            progress: 0,
            startDate: new Date(),
            dueDate: project.due_date ? new Date(project.due_date) : undefined,
          });
        }
      }
    } catch (error) {
      console.error('Error syncing projects:', error);
      throw error;
    }
  }

  // Sync invoices from Freshbooks to local storage
  public async syncInvoices(): Promise<void> {
    try {
      const invoices = await this.getInvoices();
      
      for (const invoice of invoices) {
        // Check if client exists
        const client = await storage.getClientByFreshbooksId(invoice.client_id);
        
        if (!client) {
          // Skip if client doesn't exist
          continue;
        }
        
        // Check if project exists if invoice has project_id
        let projectId = null;
        if (invoice.project_id) {
          const project = await this.getProjectByFreshbooksId(invoice.project_id);
          if (project) {
            projectId = project.id;
          }
        }
        
        // Check if invoice already exists
        const existingInvoice = await this.getInvoiceByFreshbooksId(invoice.id);
        
        if (existingInvoice) {
          // Update existing invoice
          await storage.updateInvoice(existingInvoice.id, {
            amount: `${invoice.amount.amount} ${invoice.amount.currency_code}`,
            status: this.mapInvoiceStatus(invoice.status),
            paidDate: invoice.payment_date ? new Date(invoice.payment_date) : null,
          });
        } else {
          // Create new invoice
          await storage.createInvoice({
            freshbooksId: invoice.id,
            clientId: client.id,
            projectId,
            invoiceNumber: invoice.invoice_number,
            amount: `${invoice.amount.amount} ${invoice.amount.currency_code}`,
            status: this.mapInvoiceStatus(invoice.status),
            issueDate: new Date(invoice.create_date),
            dueDate: new Date(invoice.due_date),
            paidDate: invoice.payment_date ? new Date(invoice.payment_date) : null,
          });
        }
      }
    } catch (error) {
      console.error('Error syncing invoices:', error);
      throw error;
    }
  }

  // Sync all data from Freshbooks
  public async syncAll(): Promise<void> {
    try {
      await this.syncClients();
      await this.syncProjects();
      await this.syncInvoices();
    } catch (error) {
      console.error('Error syncing all data:', error);
      throw error;
    }
  }

  // Helper methods
  private async getProjectByFreshbooksId(freshbooksId: string) {
    const projects = await storage.getAllProjects();
    return projects.find(p => p.freshbooksId === freshbooksId);
  }

  private async getInvoiceByFreshbooksId(freshbooksId: string) {
    const invoices = await storage.getAllInvoices();
    return invoices.find(i => i.freshbooksId === freshbooksId);
  }

  private mapInvoiceStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'paid';
      case 'sent':
      case 'viewed':
      case 'draft':
        return 'pending';
      case 'overdue':
        return 'overdue';
      default:
        return 'pending';
    }
  }
}

export const freshbooksService = FreshbooksService.getInstance();
