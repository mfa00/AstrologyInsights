# Replit.md

## Overview

This is a full-stack astrology blog application built with modern web technologies. The application features a celestial-themed design focused on Georgian content, including articles about horoscopes, zodiac signs, tarot, crystals, and moon phases. It provides a rich user experience with interactive components for horoscope reading, article browsing, and content discovery.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server:

- **Frontend**: React-based SPA with TypeScript
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build System**: Vite for frontend bundling and esbuild for backend
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **React with TypeScript**: Modern functional components with hooks
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management and data fetching
- **shadcn/ui**: Pre-built accessible UI components with Radix UI primitives
- **Tailwind CSS**: Custom celestial theme with CSS variables
- **Custom Design System**: Celestial color palette (cosmic-black, celestial-gold, mystic-purple, etc.)

### Backend Architecture
- **Express.js**: RESTful API server
- **TypeScript**: Type-safe server-side development
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Primary database with Neon Database integration
- **Memory Storage**: Development fallback with seeded data
- **Error Handling**: Centralized error middleware

### Database Schema
The application uses three main tables:
- **Articles**: Blog posts with title, content, author, category, engagement metrics
- **Categories**: Article categorization with Georgian translations
- **Horoscopes**: Daily horoscope content by zodiac sign

### API Endpoints
- `GET /api/articles` - List articles with filtering and pagination
- `GET /api/articles/:id` - Single article with view tracking
- `GET /api/articles/search/:query` - Article search functionality
- `GET /api/articles/popular` - Popular articles by views
- `GET /api/categories` - Available categories
- `GET /api/horoscopes/:sign` - Daily horoscope by zodiac sign

## Data Flow

1. **Client Request**: User interacts with React components
2. **Query Management**: TanStack Query handles API calls and caching
3. **API Processing**: Express routes process requests
4. **Database Operations**: Drizzle ORM executes type-safe queries
5. **Response Handling**: JSON responses with error handling
6. **UI Updates**: React components re-render with new data

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configurable via DATABASE_URL)
- **Neon Database**: Cloud PostgreSQL provider integration
- **Drizzle Kit**: Database migrations and schema management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first styling
- **React Hook Form**: Form management
- **date-fns**: Date formatting utilities

### Development Tools
- **Vite**: Frontend development server and bundling
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development
- Uses tsx for TypeScript execution
- Vite dev server with HMR for frontend
- Memory storage fallback when database unavailable
- Replit-specific plugins for development experience

### Production
- Frontend: Vite build to static assets
- Backend: esbuild bundle to single JavaScript file
- Database: PostgreSQL connection via DATABASE_URL
- Static file serving from Express
- Port configuration for Replit hosting (5000 -> 80)

### Build Process
1. `npm run build`: Builds frontend assets and bundles backend
2. Frontend assets output to `dist/public`
3. Backend bundle output to `dist/index.js`
4. `npm run start`: Runs production server

## Recent Changes
- **June 24, 2025**: Enhanced theme with sophisticated typography using Playfair Display and Inter fonts
- **June 24, 2025**: Removed Georgian categories "ტარო", "პროგნოზი", "ზოდიაქო" as requested
- **June 24, 2025**: Implemented complete admin panel with article and user management
- **June 24, 2025**: Added database integration with PostgreSQL support
- **June 24, 2025**: Upgraded design with advanced glassmorphism effects and improved spacing
- **June 24, 2025**: Created sophisticated white background with sky blue accent theme
- **June 24, 2025**: Added comprehensive authentic Georgian astrology content (12 articles)
- **June 24, 2025**: Applied sophisticated theming across all pages (article, category, 404)
- **June 24, 2025**: Integrated extensive content covering horoscopes, crystals, meditation, spirituality

## User Preferences

Preferred communication style: Simple, everyday language.