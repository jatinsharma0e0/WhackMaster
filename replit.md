# Whack-a-Mole Game

## Overview

This is a full-stack web application built with React (frontend) and Express.js (backend) that implements a classic Whack-a-Mole game. The application uses a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components for a polished user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks (useState, useEffect) for local state
- **HTTP Client**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (configured but not actively used yet)
- **ORM**: Drizzle ORM for database operations
- **Storage**: Currently using in-memory storage (MemStorage class)
- **Session Management**: Configured for connect-pg-simple (PostgreSQL sessions)
- **Development**: Hot reloading with tsx

### Build System
- **Frontend**: Vite with React plugin
- **Backend**: esbuild for production builds
- **TypeScript**: Shared configuration across client, server, and shared modules
- **Development**: Concurrent development with Vite dev server and Express server

## Key Components

### Game Logic
- **Game State Management**: Handles game timing, score tracking, and high score persistence
- **Mole Management**: Controls mole visibility, hit detection, and visual effects
- **Local Storage**: Persists high scores between sessions

### UI Components
- **Game Board**: 3x3 grid of mole holes with click interactions
- **Score Display**: Real-time score and timer updates
- **Game Controls**: Start/restart button functionality
- **Responsive Design**: Mobile-friendly interface

### Backend Infrastructure
- **Storage Interface**: Abstracted storage layer (IStorage) for future database integration
- **Route Structure**: Organized API routes under /api prefix
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Detailed API request logging for development

## Data Flow

### Game Flow
1. User clicks start button to begin game
2. Timer starts countdown from 30 seconds
3. Moles randomly appear and disappear at intervals
4. User clicks moles to increment score
5. Game ends when timer reaches zero
6. High score is saved to localStorage if beaten

### Client-Server Communication
- **API Client**: Configured fetch-based client with error handling
- **Query Management**: TanStack Query for server state caching
- **Authentication Ready**: Cookie-based session management prepared

## External Dependencies

### Frontend Libraries
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS with class-variance-authority
- **Utilities**: clsx, date-fns, lucide-react icons

### Backend Libraries
- **Server Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL support (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Development Tools**: tsx for TypeScript execution

### Development Tools
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Replit Integration**: Vite plugins for Replit development environment

## Deployment Strategy

### Development
- **Local Development**: Vite dev server for frontend, tsx for backend hot reloading
- **Environment**: NODE_ENV=development with development-specific configurations
- **Database**: Configured for PostgreSQL with connection string from environment

### Production
- **Build Process**: Vite builds frontend to dist/public, esbuild bundles backend
- **Deployment**: Single Node.js process serving both static files and API
- **Database**: PostgreSQL with Drizzle ORM for production data persistence
- **Environment**: NODE_ENV=production with optimized configurations

### Database Schema
- **Users Table**: Basic user structure with username/password (prepared for future auth)
- **Migrations**: Managed through Drizzle Kit with PostgreSQL dialect
- **Current State**: In-memory storage for development, database ready for production

The application is structured as a monorepo with clear separation between client, server, and shared code, making it easy to maintain and extend with additional features.