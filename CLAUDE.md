# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Art Dealer MVP is a Next.js 15 application for discovering, collecting, and tracking artworks from museums worldwide. It's built with TypeScript, Supabase for backend services, and Tailwind CSS with shadcn/ui for styling.

## Development Commands

```bash
# Development
cd art-dealer-mvp
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# The main application is in the art-dealer-mvp/ subdirectory
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, React 19
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API for auth and collections
- **Data Fetching**: Custom API functions with Supabase client

### Key Directory Structure
```
art-dealer-mvp/src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── artwork/[id]/      # Individual artwork pages
│   ├── collections/       # User collections
│   ├── profile/           # User profile
│   └── search/            # Search results
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── artwork/          # Artwork-specific components
│   ├── auth/             # Authentication forms
│   └── layout/           # Layout components
├── contexts/             # React Context providers
├── lib/                  # Utilities and configurations
│   ├── supabase.ts      # Supabase client and types
│   ├── api.ts           # API functions
│   └── utils.ts         # Utility functions
```

## Database Schema

### Core Tables
- **users**: User profiles (id, email, first_name, last_name, avatar_url)
- **artworks**: Artwork data (id, title, artist, date, period, medium, museum, image_url, etc.)
- **user_collections**: User's saved artworks with collection_type ('want_to_see' | 'seen')

### Authentication & Security
- Supabase Auth with email/password
- Row Level Security (RLS) policies enforced
- Users can only access their own collections
- All authenticated users can read artworks

## Key Features Implemented

### Authentication System
- User registration and login via AuthContext
- Automatic user profile creation with database trigger
- Protected routes and session management
- Password reset functionality

### Art Discovery
- Paginated artwork browsing with filters
- Search by title, artist, or museum
- Artwork detail pages with full information
- Responsive card-based layout

### Collection Management
- "Want to See" collections for future visits
- "Seen" collections for visited artworks
- Real-time collection updates via CollectionsContext
- Add/remove artworks from collections

## Environment Setup

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Code Patterns

### API Functions
- All database interactions go through `src/lib/api.ts`
- Uses TypeScript interfaces defined in `src/lib/supabase.ts`
- Handles pagination with cursor-based approach
- Error handling with try/catch blocks

### Component Structure
- Uses shadcn/ui components for consistent design
- React Hook Form for form handling
- Responsive design with Tailwind CSS
- Context hooks for global state (useAuth, useCollections)

### Type Safety
- Strict TypeScript configuration
- Database types exported from supabase.ts
- Interface definitions for all API responses
- Proper typing for component props

## Database Setup Requirements

The application requires specific database setup including:
- User table with RLS policies
- Artworks table with sample data
- User collections junction table
- Database trigger for automatic user profile creation (see SETUP_DATABASE_TRIGGER.md)

## Testing & Quality

- ESLint configured with Next.js and TypeScript rules
- No test framework currently configured
- TypeScript strict mode enabled
- Database queries use Supabase client with proper error handling