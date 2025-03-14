import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User-related schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("client"), // admin, client, pending
  status: text("status").notNull().default("active"), // active, disabled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Client-related schemas
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  freshbooksId: text("freshbooks_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Project-related schemas
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  status: text("status").default("planning"), // planning, in_progress, on_hold, completed
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  budget: doublePrecision("budget"),
  progress: integer("progress").default(0),
  freshbooksId: text("freshbooks_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Invoice-related schemas
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").default("pending"), // pending, paid, overdue
  dueDate: timestamp("due_date"),
  description: text("description"),
  freshbooksId: text("freshbooks_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Document-related schemas
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type"),
  size: integer("size"),
  projectId: integer("project_id").references(() => projects.id),
  clientId: integer("client_id").references(() => clients.id),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Inquiry-related schemas
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiries)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Branding and Theme settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").default("SD Tech Pros"),
  logoPath: text("logo_path"),
  primaryColor: text("primary_color").default("hsl(222.2 47.4% 11.2%)"),
  theme: text("theme").default("light"), // light, dark
  radius: doublePrecision("radius").default(0.5),
  siteTitle: text("site_title").default("SD Tech Pros Client Portal"),
  siteDescription: text("site_description"),
  favicon: text("favicon"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings)
  .omit({ id: true, updatedAt: true });

// Content management for public website
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // hero, service, about, testimonial, contact
  title: text("title"),
  subtitle: text("subtitle"),
  content: text("content"),
  imagePath: text("image_path"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentSchema = createInsertSchema(contents)
  .omit({ id: true, updatedAt: true });

// Activity log
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  entityType: text("entity_type"), // project, client, invoice, etc.
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities)
  .omit({ id: true, createdAt: true });

// API credentials for Freshbooks
export const apiConnections = pgTable("api_connections", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(), // freshbooks, google_analytics, etc.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApiConnectionSchema = createInsertSchema(apiConnections)
  .omit({ id: true, updatedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ApiConnection = typeof apiConnections.$inferSelect;
export type InsertApiConnection = z.infer<typeof insertApiConnectionSchema>;
