import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
  try {
    await client.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'client',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        notes TEXT,
        user_id INTEGER REFERENCES users(id),
        freshbooks_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        status TEXT DEFAULT 'planning',
        start_date TIMESTAMP WITH TIME ZONE,
        due_date TIMESTAMP WITH TIME ZONE,
        budget DOUBLE PRECISION,
        progress INTEGER DEFAULT 0,
        freshbooks_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number TEXT NOT NULL,
        project_id INTEGER REFERENCES projects(id),
        client_id INTEGER NOT NULL REFERENCES clients(id),
        amount DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'pending',
        due_date TIMESTAMP WITH TIME ZONE,
        description TEXT,
        freshbooks_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        type TEXT,
        size INTEGER,
        project_id INTEGER REFERENCES projects(id),
        client_id INTEGER REFERENCES clients(id),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create inquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        company_name TEXT DEFAULT 'SD Tech Pros',
        logo_path TEXT,
        primary_color TEXT DEFAULT 'hsl(222.2 47.4% 11.2%)',
        theme TEXT DEFAULT 'light',
        radius DOUBLE PRECISION DEFAULT 0.5,
        site_title TEXT DEFAULT 'SD Tech Pros Client Portal',
        site_description TEXT,
        favicon TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create contents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contents (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT,
        subtitle TEXT,
        content TEXT,
        image_path TEXT,
        "order" INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        details TEXT,
        entity_type TEXT,
        entity_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create API connections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_connections (
        id SERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add a default admin user
    await client.query(`
      INSERT INTO users (username, password, name, email, role)
      VALUES ('admin', '407eb6692bd8b03aa6bd939eea0f7f2b9579a06119499c89030f48480318e345b0efb442af7beef6c9e63f3c3ef79f93cdaa1a2c236866c1fefbe58d672ac821.9c05feca69b307af2084b6bdf6722c1a', 'Admin User', 'admin@sdtechpros.com', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    console.log('Database schema initialized successfully!');
  } catch (error) {
    console.error('Error initializing database schema:', error);
  } finally {
    await client.end();
  }
};

createTables();