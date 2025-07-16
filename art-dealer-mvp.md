# Art Dealer MVP - User Flow Specification

## 1. MVP Overview

**Goal**: Create a minimal viable product that allows users to discover, search, collect, and track art pieces they've seen.

**Core Value**: Simple art discovery and personal collection management.

**Target Timeline**: 8-12 weeks development

## 2. MVP User Flow

### 2.1 Primary User Journey
```
Landing Page → Login/Register → Home (Discover) → Search/Browse → 
View Artwork → Add to Collection OR Mark as Seen → Profile/Collections
```

### 2.2 Detailed User Flow

#### Step 1: Authentication
- User visits landing page
- User signs up with email/password or OAuth (Google)
- User verifies email (if needed)
- User is redirected to home/discover page

#### Step 2: Art Discovery
- User sees a feed of artwork cards
- Each card shows: artwork image, title, artist, date, museum
- User can scroll through paginated results
- User can filter by basic criteria (period, artist, museum)

#### Step 3: Search
- User can search by artwork title, artist name, or museum
- Search results display in same card format
- User can combine search with filters

#### Step 4: Artwork Details
- User clicks on artwork card
- User sees full artwork details page with:
  - High-resolution image
  - Complete artwork information
  - Museum and location details
  - Action buttons (Add to Collection, Mark as Seen)

#### Step 5: Collection Management
- User can add artwork to "Want to See" collection
- User can mark artwork as "Seen" (moves to seen collection)
- User can view their collections in profile

#### Step 6: Profile & Collections
- User can view their profile
- User can see "Want to See" collection
- User can see "Seen" collection
- User can remove items from collections

## 3. MVP Features

### 3.1 Authentication
- **Sign Up**: Email/password registration
- **Login**: Email/password authentication
- **OAuth**: Google sign-in integration
- **Password Reset**: Basic password recovery

### 3.2 Art Discovery
- **Browse Feed**: Paginated artwork cards
- **Basic Filters**: Period, artist, museum
- **Search**: Text search by title, artist, museum
- **Artwork Details**: Full information view

### 3.3 Collections
- **Want to See**: Save artworks to visit later
- **Seen**: Mark artworks as viewed
- **Collection Views**: List view of saved artworks
- **Remove from Collection**: Delete functionality

### 3.4 User Profile
- **Basic Profile**: Name, email, avatar
- **Collection Summary**: Count of saved and seen artworks
- **Collection Access**: View and manage collections

## 4. Required APIs

### 4.1 Authentication APIs
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/reset-password
```

### 4.2 Artwork APIs
```
GET /api/artworks                    # Get paginated artworks
GET /api/artworks/:id                # Get single artwork
GET /api/artworks/search?q=:query    # Search artworks
```

### 4.3 Collection APIs
```
GET /api/collections/want-to-see      # Get user's "Want to See" collection
GET /api/collections/seen             # Get user's "Seen" collection
POST /api/collections/want-to-see     # Add artwork to "Want to See"
POST /api/collections/seen            # Add artwork to "Seen" (mark as viewed)
DELETE /api/collections/want-to-see/:artworkId  # Remove from "Want to See"
DELETE /api/collections/seen/:artworkId         # Remove from "Seen"
```

### 4.4 User APIs
```
GET /api/users/profile               # Get user profile
PUT /api/users/profile               # Update user profile
```

## 5. Database Schema (Supabase)

### 5.1 Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Artworks Table
```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  date VARCHAR(100),
  period VARCHAR(100),
  medium VARCHAR(255),
  dimensions VARCHAR(255),
  description TEXT,
  museum VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### User Collections Table
```sql
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  collection_type VARCHAR(50) NOT NULL, -- 'want_to_see' or 'seen'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, artwork_id, collection_type)
);
```

### 5.2 Row Level Security (RLS) Policies

#### Users Table
```sql
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
```

#### Artworks Table
```sql
-- All authenticated users can read artworks
CREATE POLICY "Authenticated users can read artworks" ON artworks FOR SELECT 
TO authenticated USING (true);
```

#### User Collections Table
```sql
-- Users can only access their own collections
CREATE POLICY "Users can view own collections" ON user_collections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON user_collections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON user_collections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON user_collections FOR DELETE 
USING (auth.uid() = user_id);
```

## 6. Technical Implementation

### 6.1 Frontend Structure (Next.js 15)
```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /page.tsx                    # Home/Discover page
  /artwork/[id]/page.tsx       # Artwork details
  /search/page.tsx             # Search results
  /profile/page.tsx            # User profile
  /collections/page.tsx        # User collections
/components
  /ui/                         # Shadcn/ui components
  /artwork/
    artwork-card.tsx           # Artwork card component
    artwork-details.tsx        # Artwork details component
  /collections/
    collection-list.tsx        # Collection list component
  /auth/
    login-form.tsx            # Login form
    register-form.tsx         # Register form
/lib
  /supabase.ts                # Supabase client
  /auth.ts                    # Auth utilities
  /api.ts                     # API functions
```

### 6.2 State Management (Context API)
```typescript
// AuthContext - User authentication state
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

// CollectionsContext - User collections state
interface CollectionsContextType {
  wantToSee: Artwork[];
  seen: Artwork[];
  addToWantToSee: (artwork: Artwork) => Promise<void>;
  markAsSeen: (artwork: Artwork) => Promise<void>;
  removeFromCollection: (artworkId: string, type: 'want_to_see' | 'seen') => Promise<void>;
}
```

### 6.3 Key Components

#### Artwork Card
```typescript
interface ArtworkCardProps {
  artwork: Artwork;
  onAddToCollection: (artwork: Artwork) => void;
  onMarkAsSeen: (artwork: Artwork) => void;
}
```

#### Search & Filter
```typescript
interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: ArtworkFilters) => void;
}
```

## 7. MVP Constraints & Limitations

### 7.1 What's NOT in MVP
- User profiles (beyond basic info)
- Social features (following, sharing)
- Advanced search and filters
- Museum integration
- Real-time features
- Image upload
- Comments and reviews
- Multiple custom collections
- Mobile app

### 7.2 MVP Assumptions
- Pre-populated artwork database (no museum API integration yet)
- Basic image hosting (Supabase Storage)
- Simple authentication (email/password + Google OAuth)
- Basic responsive design
- No offline functionality
- No push notifications

## 8. Success Metrics

### 8.1 User Engagement
- User registration rate
- Daily active users
- Time spent browsing artworks
- Search usage frequency

### 8.2 Collection Activity
- Average artworks saved per user
- Want to See vs. Seen ratio
- Collection interaction frequency

### 8.3 Technical Metrics
- Page load times < 2 seconds
- Search response time < 500ms
- API response times < 200ms
- 99.5% uptime

## 9. Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up Next.js 15 project
- Configure Supabase
- Implement authentication
- Create basic UI components

### Phase 2: Core Features (Weeks 3-5)
- Artwork discovery and browsing
- Search functionality
- Artwork details page
- Basic collection management

### Phase 3: Collections & Profile (Weeks 6-7)
- User profile page
- Collection views
- Add/remove from collections
- Mark as seen functionality

### Phase 4: Polish & Testing (Weeks 8-9)
- UI/UX improvements
- Performance optimization
- Testing and bug fixes
- Deployment preparation

## 10. Next Steps After MVP

### 10.1 Immediate Enhancements
- Multiple custom collections
- Advanced search filters
- Museum API integration
- User profile enhancements

### 10.2 Future Features
- Social features
- Mobile app
- Museum guide integration
- AI-powered recommendations

---

This MVP specification provides a clear roadmap for building the core Art Dealer functionality with a focus on user value and technical simplicity. 