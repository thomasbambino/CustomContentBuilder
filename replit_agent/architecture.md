# Architecture Overview

## Overview

This repository contains a full-stack web application built with React on the frontend and Express.js on the backend. The application appears to be a client management portal for "SD Tech Pros" that includes features for client management, project management, invoicing, and content management.

The application follows a modern web development architecture with a clear separation between client and server code. It uses TypeScript throughout the codebase for type safety and better developer experience.

## System Architecture

The application follows a client-server architecture with the following key components:

1. **Frontend**: A React application built with TypeScript, using modern React patterns including hooks and context API. The UI is built with Shadcn UI components, which are based on Radix UI primitives.

2. **Backend**: An Express.js server written in TypeScript that provides RESTful API endpoints for the frontend. The server handles authentication, data operations, and external service integrations.

3. **Database**: PostgreSQL database accessed through Drizzle ORM, with schema definitions shared between client and server.

4. **Authentication**: Session-based authentication system using Passport.js with a local strategy (username/password).

### Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │━━━━▶│  Express Server │━━━━▶│  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │                 │
                        │  External APIs  │
                        │  (FreshBooks)   │
                        │                 │
                        └─────────────────┘
```

## Key Components

### Frontend Components

1. **Client-Side Routing**: The application uses Wouter for client-side routing, with defined routes for both public, client, and admin areas.

2. **UI Components**: The application uses Shadcn UI components (based on Radix UI) for a consistent design system across the application.

3. **State Management**: 
   - React Query for server state management and data fetching
   - React Context for global application state (auth, settings, theme)
   - React Hook Form for form state management and validation

4. **Authentication**: Custom authentication hooks that communicate with the server's authentication endpoints.

5. **Pages Structure**:
   - Public pages (home, inquiry form)
   - Authentication pages (login/register)
   - Admin dashboard and related pages
   - Client dashboard and related pages

### Backend Components

1. **API Routes**: Express.js routes organized by resource type (users, clients, projects, etc.)

2. **Authentication**: Passport.js with session-based authentication, using scrypt for password hashing

3. **Database Access**: Drizzle ORM for type-safe database operations

4. **External Integrations**: Integration with FreshBooks API for accounting/invoicing

5. **Storage Management**: Custom storage interface for database operations

### Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM. Key entities include:

1. **Users**: Application users with roles (admin, client)
2. **Clients**: Business clients
3. **Projects**: Projects associated with clients
4. **Invoices**: Financial records for projects
5. **Documents**: Files/documents associated with projects
6. **Inquiries**: New business inquiries
7. **Content**: Website content management
8. **Activities**: System activity logs
9. **API Connections**: External service API configurations

## Data Flow

### Authentication Flow

1. User submits login credentials via the login form
2. Server validates credentials and creates a session
3. Frontend stores user information in React context
4. Protected routes check authentication status before rendering

### Data Operation Flow

1. Frontend components fetch data using React Query
2. API requests are made to the Express server
3. Server validates requests and performs database operations using Drizzle ORM
4. Results are returned to the frontend as JSON
5. React Query caches results and updates the UI

### Content Management Flow

1. Admin users can edit website content through the admin interface
2. Content changes are saved to the database
3. Public site renders content from the database

## External Dependencies

### Frontend Dependencies

1. **React**: UI library
2. **Tailwind CSS**: Utility-first CSS framework
3. **Radix UI**: Primitive UI components
4. **Shadcn UI**: Component collection built on Radix UI
5. **React Query**: Data fetching and caching library
6. **Wouter**: Lightweight routing library
7. **React Hook Form**: Form management
8. **Zod**: Schema validation

### Backend Dependencies

1. **Express**: Web server framework
2. **Passport**: Authentication middleware
3. **Drizzle ORM**: Database ORM
4. **PostgreSQL**: Database
5. **Express Session**: Session management
6. **Crypto**: Cryptographic functions for password hashing

### External Services

1. **FreshBooks**: Integration for accounting and invoicing

## Deployment Strategy

The application is configured to be deployed on Replit, with the following considerations:

1. **Build Process**: 
   - Frontend: Vite builds the React application into static assets
   - Backend: TypeScript is compiled using esbuild

2. **Production Setup**:
   - Static assets are served by the Express server
   - Environmental variables control production behavior

3. **Database**:
   - Uses Neon PostgreSQL (serverless Postgres)
   - Database URL is provided via environment variables

4. **Replit Configuration**:
   - Configured in `.replit` file
   - Uses Node.js 20 and Replit workflow tools
   - Exposed on port 80 externally, 5000 internally

## Security Considerations

1. **Authentication**: 
   - Password hashing using scrypt with salt
   - Session-based authentication with secure cookies
   - Role-based access control for different user types

2. **Data Validation**:
   - Input validation using Zod schemas
   - Shared schema definitions between client and server

3. **API Security**:
   - Protected routes require authentication
   - Role-based middleware for authorization

## Development Workflow

1. **Local Development**:
   - `npm run dev` starts both server and client in development mode
   - Vite provides HMR for the frontend
   - TypeScript provides type checking

2. **Database Schema Management**:
   - Drizzle Kit for schema migrations
   - `npm run db:push` to apply schema changes

3. **Production Build**:
   - `npm run build` creates production build
   - `npm run start` runs the production server