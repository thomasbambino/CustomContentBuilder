import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import * as schema from './shared/schema';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  console.log('Creating database schema...');
  
  // Create tables one by one
  await sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "username" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created users table');

  await sql`
    CREATE TABLE IF NOT EXISTS "clients" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT,
      "contactPerson" TEXT,
      "phone" TEXT,
      "address" TEXT,
      "notes" TEXT,
      "userId" INTEGER REFERENCES "users"("id"),
      "freshbooksId" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created clients table');

  await sql`
    CREATE TABLE IF NOT EXISTS "projects" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "clientId" INTEGER NOT NULL REFERENCES "clients"("id"),
      "status" TEXT,
      "startDate" TIMESTAMP,
      "dueDate" TIMESTAMP,
      "budget" DECIMAL,
      "progress" INTEGER,
      "freshbooksId" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created projects table');

  await sql`
    CREATE TABLE IF NOT EXISTS "invoices" (
      "id" SERIAL PRIMARY KEY,
      "invoiceNumber" TEXT NOT NULL,
      "clientId" INTEGER NOT NULL REFERENCES "clients"("id"),
      "projectId" INTEGER REFERENCES "projects"("id"),
      "amount" DECIMAL NOT NULL,
      "status" TEXT,
      "dueDate" TIMESTAMP,
      "description" TEXT,
      "freshbooksId" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created invoices table');

  await sql`
    CREATE TABLE IF NOT EXISTS "documents" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "path" TEXT NOT NULL,
      "type" TEXT,
      "size" INTEGER,
      "projectId" INTEGER REFERENCES "projects"("id"),
      "clientId" INTEGER REFERENCES "clients"("id"),
      "uploadedBy" INTEGER REFERENCES "users"("id"),
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created documents table');

  await sql`
    CREATE TABLE IF NOT EXISTS "inquiries" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "message" TEXT NOT NULL,
      "status" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created inquiries table');

  await sql`
    CREATE TABLE IF NOT EXISTS "settings" (
      "id" SERIAL PRIMARY KEY,
      "key" TEXT NOT NULL UNIQUE,
      "value" JSONB,
      "updatedBy" INTEGER REFERENCES "users"("id"),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created settings table');

  await sql`
    CREATE TABLE IF NOT EXISTS "contents" (
      "id" SERIAL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "title" TEXT,
      "subtitle" TEXT,
      "content" TEXT,
      "imagePath" TEXT,
      "order" INTEGER,
      "isActive" BOOLEAN,
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created contents table');

  await sql`
    CREATE TABLE IF NOT EXISTS "activities" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER REFERENCES "users"("id"),
      "action" TEXT NOT NULL,
      "details" TEXT,
      "entityType" TEXT,
      "entityId" INTEGER,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created activities table');

  await sql`
    CREATE TABLE IF NOT EXISTS "api_connections" (
      "id" SERIAL PRIMARY KEY,
      "provider" TEXT NOT NULL UNIQUE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "expiresAt" TIMESTAMP,
      "accountId" TEXT,
      "metadata" JSONB,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created api_connections table');

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await hashPassword('admin123');
  
  try {
    const insertResult = await sql`
      INSERT INTO users (name, username, email, password, role, "createdAt", "updatedAt")
      VALUES ('Admin User', 'admin', 'admin@sdtechpros.com', ${hashedPassword}, 'admin', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
      RETURNING *
    `;
    
    if (insertResult.length > 0) {
      console.log('Created admin user: admin / admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  // Add default settings
  try {
    await sql`
      INSERT INTO settings (key, value, "updatedAt")
      VALUES ('companyInfo', '{"companyName":"SD Tech Pros","logoPath":null,"primaryColor":"#0f766e","contactEmail":"contact@sdtechpros.com","contactPhone":"(555) 123-4567"}', NOW())
      ON CONFLICT (key) DO NOTHING
    `;
    console.log('Added default settings');
  } catch (error) {
    console.error('Error adding default settings:', error);
  }

  console.log('Database setup complete!');
  
  // Close the database connection
  await sql.end();
}

main().catch((error) => {
  console.error('Error setting up database:', error);
  process.exit(1);
});