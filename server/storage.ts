import { 
  users, User, InsertUser, 
  clients, Client, InsertClient,
  projects, Project, InsertProject,
  invoices, Invoice, InsertInvoice,
  documents, Document, InsertDocument,
  inquiries, Inquiry, InsertInquiry,
  settings, Setting, InsertSetting,
  contents, Content, InsertContent,
  activities, Activity, InsertActivity,
  apiConnections, ApiConnection, InsertApiConnection
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientByUserId(userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByClientId(clientId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  
  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByClientId(clientId: number): Promise<Invoice[]>;
  getInvoicesByProjectId(projectId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByProjectId(projectId: number): Promise<Document[]>;
  getDocumentsByClientId(clientId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  getAllDocuments(): Promise<Document[]>;
  
  // Inquiry operations
  getInquiry(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: number, inquiry: Partial<Inquiry>): Promise<Inquiry | undefined>;
  getPendingInquiries(): Promise<Inquiry[]>;
  getAllInquiries(): Promise<Inquiry[]>;
  
  // Settings operations
  getSettings(): Promise<Setting | undefined>;
  updateSettings(settings: Partial<Setting>): Promise<Setting | undefined>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  getContentByType(type: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<Content>): Promise<Content | undefined>;
  deleteContent(id: number): Promise<boolean>;
  getAllContents(): Promise<Content[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  
  // API Connection operations
  getApiConnection(provider: string): Promise<ApiConnection | undefined>;
  updateApiConnection(provider: string, connection: Partial<ApiConnection>): Promise<ApiConnection | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private invoices: Map<number, Invoice>;
  private documents: Map<number, Document>;
  private inquiries: Map<number, Inquiry>;
  private settingsObj: Setting | undefined;
  private contents: Map<number, Content>;
  private activities: Map<number, Activity>;
  private apiConnections: Map<string, ApiConnection>;
  
  sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private clientCurrentId: number;
  private projectCurrentId: number;
  private invoiceCurrentId: number;
  private documentCurrentId: number;
  private inquiryCurrentId: number;
  private contentCurrentId: number;
  private activityCurrentId: number;
  private apiConnectionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.invoices = new Map();
    this.documents = new Map();
    this.inquiries = new Map();
    this.contents = new Map();
    this.activities = new Map();
    this.apiConnections = new Map();
    
    this.userCurrentId = 1;
    this.clientCurrentId = 1;
    this.projectCurrentId = 1;
    this.invoiceCurrentId = 1;
    this.documentCurrentId = 1;
    this.inquiryCurrentId = 1;
    this.contentCurrentId = 1;
    this.activityCurrentId = 1;
    this.apiConnectionCurrentId = 1;
    
    this.settingsObj = {
      id: 1,
      companyName: "SD Tech Pros",
      logoPath: null,
      primaryColor: "hsl(222.2 47.4% 11.2%)",
      theme: "light",
      radius: 0.5,
      siteTitle: "SD Tech Pros Client Portal",
      siteDescription: null,
      favicon: null,
      updatedAt: new Date()
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now, updatedAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userUpdate, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClientByUserId(userId: number): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.userId === userId
    );
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientCurrentId++;
    const now = new Date();
    const client: Client = { ...insertClient, id, createdAt: now, updatedAt: now };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientUpdate: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient: Client = { ...client, ...clientUpdate, updatedAt: new Date() };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const now = new Date();
    const project: Project = { ...insertProject, id, createdAt: now, updatedAt: now };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = { ...project, ...projectUpdate, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async getInvoicesByClientId(clientId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.clientId === clientId
    );
  }
  
  async getInvoicesByProjectId(projectId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.projectId === projectId
    );
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceCurrentId++;
    const now = new Date();
    const invoice: Invoice = { ...insertInvoice, id, createdAt: now, updatedAt: now };
    this.invoices.set(id, invoice);
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceUpdate: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice: Invoice = { ...invoice, ...invoiceUpdate, updatedAt: new Date() };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }
  
  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByProjectId(projectId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.projectId === projectId
    );
  }
  
  async getDocumentsByClientId(clientId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.clientId === clientId
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentCurrentId++;
    const now = new Date();
    const document: Document = { ...insertDocument, id, createdAt: now, updatedAt: now };
    this.documents.set(id, document);
    return document;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  // Inquiry operations
  async getInquiry(id: number): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }
  
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryCurrentId++;
    const now = new Date();
    const inquiry: Inquiry = { ...insertInquiry, id, createdAt: now, updatedAt: now };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }
  
  async updateInquiry(id: number, inquiryUpdate: Partial<Inquiry>): Promise<Inquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;
    
    const updatedInquiry: Inquiry = { ...inquiry, ...inquiryUpdate, updatedAt: new Date() };
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  async getPendingInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).filter(
      (inquiry) => inquiry.status === "pending"
    );
  }
  
  async getAllInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }
  
  // Settings operations
  async getSettings(): Promise<Setting | undefined> {
    return this.settingsObj;
  }
  
  async updateSettings(settingsUpdate: Partial<Setting>): Promise<Setting | undefined> {
    if (!this.settingsObj) return undefined;
    
    this.settingsObj = { ...this.settingsObj, ...settingsUpdate, updatedAt: new Date() };
    return this.settingsObj;
  }
  
  // Content operations
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async getContentByType(type: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.type === type && content.isActive
    );
  }
  
  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.contentCurrentId++;
    const now = new Date();
    const content: Content = { ...insertContent, id, updatedAt: now };
    this.contents.set(id, content);
    return content;
  }
  
  async updateContent(id: number, contentUpdate: Partial<Content>): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;
    
    const updatedContent: Content = { ...content, ...contentUpdate, updatedAt: new Date() };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async deleteContent(id: number): Promise<boolean> {
    return this.contents.delete(id);
  }
  
  async getAllContents(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }
  
  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, createdAt: now };
    this.activities.set(id, activity);
    return activity;
  }
  
  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  // API Connection operations
  async getApiConnection(provider: string): Promise<ApiConnection | undefined> {
    return this.apiConnections.get(provider);
  }
  
  async updateApiConnection(provider: string, connectionUpdate: Partial<ApiConnection>): Promise<ApiConnection | undefined> {
    const connection = this.apiConnections.get(provider);
    
    if (connection) {
      const updatedConnection: ApiConnection = { ...connection, ...connectionUpdate, updatedAt: new Date() };
      this.apiConnections.set(provider, updatedConnection);
      return updatedConnection;
    } else if (connectionUpdate.provider) {
      const id = this.apiConnectionCurrentId++;
      const now = new Date();
      const newConnection: ApiConnection = { 
        id,
        provider: connectionUpdate.provider,
        accessToken: connectionUpdate.accessToken || null,
        refreshToken: connectionUpdate.refreshToken || null,
        expiresAt: connectionUpdate.expiresAt || null,
        isActive: connectionUpdate.isActive !== undefined ? connectionUpdate.isActive : true,
        updatedAt: now
      };
      this.apiConnections.set(provider, newConnection);
      return newConnection;
    }
    
    return undefined;
  }
}

export const storage = new MemStorage();
