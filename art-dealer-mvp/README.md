# Art Dealer MVP

A Next.js 15 application for discovering, collecting, and tracking artworks from museums worldwide.

## Features

- **User Authentication**: Sign up, login, and profile management with Supabase Auth
- **Art Discovery**: Browse and discover artworks with pagination
- **Search**: Search artworks by title, artist, or museum
- **Collections**: Save artworks to "Want to See" and mark them as "Seen"
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Image Storage**: Supabase Storage

## Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd art-dealer-mvp
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create artworks table
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

-- Create user_collections table
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  collection_type VARCHAR(50) NOT NULL CHECK (collection_type IN ('want_to_see', 'seen')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, artwork_id, collection_type)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for artworks table
CREATE POLICY "Authenticated users can read artworks" ON artworks FOR SELECT TO authenticated USING (true);

-- RLS Policies for user_collections table
CREATE POLICY "Users can view own collections" ON user_collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON user_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON user_collections FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_artworks_title ON artworks(title);
CREATE INDEX idx_artworks_artist ON artworks(artist);
CREATE INDEX idx_artworks_museum ON artworks(museum);
CREATE INDEX idx_artworks_period ON artworks(period);
CREATE INDEX idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX idx_user_collections_artwork_id ON user_collections(artwork_id);
```

### 4. Sample Data (Optional)

Add some sample artworks to test the application:

```sql
INSERT INTO artworks (title, artist, date, period, medium, museum, description, image_url) VALUES
('Starry Night', 'Vincent van Gogh', '1889', 'Post-Impressionism', 'Oil on canvas', 'Museum of Modern Art', 'A swirling night sky over a village', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'),
('The Great Wave off Kanagawa', 'Katsushika Hokusai', '1831', 'Edo period', 'Woodblock print', 'Metropolitan Museum of Art', 'A large wave threatening boats off the coast of Kanagawa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg'),
('Mona Lisa', 'Leonardo da Vinci', '1503-1519', 'Renaissance', 'Oil on poplar', 'Louvre Museum', 'Portrait of Lisa Gherardini, wife of Francesco del Giocondo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'),
('The Persistence of Memory', 'Salvador Dalí', '1931', 'Surrealism', 'Oil on canvas', 'Museum of Modern Art', 'Melting clocks in a dreamlike landscape', 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg'),
('Girl with a Pearl Earring', 'Johannes Vermeer', '1665', 'Baroque', 'Oil on canvas', 'Mauritshuis', 'Portrait of a girl with a mysterious pearl earring', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg');
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── artwork/
│   │   └── ArtworkCard.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/
│   │   └── Header.tsx
│   └── ui/
├── contexts/
│   ├── AuthContext.tsx
│   └── CollectionsContext.tsx
├── lib/
│   ├── api.ts
│   ├── supabase.ts
│   └── utils.ts
```

## Key Features Implemented

### Authentication
- User registration and login
- Password reset functionality
- Protected routes
- User profile management

### Art Discovery
- Paginated artwork feed
- Search functionality
- Responsive card layout
- Image loading states

### Collections
- "Want to See" collection
- "Seen" collection
- Real-time collection updates
- Collection counts in navigation

### UI/UX
- Responsive design
- Loading states
- Error handling
- Accessible components

## API Endpoints

The application uses Supabase's auto-generated REST API:

- `GET /artworks` - Get paginated artworks
- `GET /artworks?search=query` - Search artworks
- `POST /user_collections` - Add artwork to collection
- `DELETE /user_collections` - Remove artwork from collection

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Page**: Create in `src/app/`
2. **New Component**: Create in `src/components/`
3. **New API Function**: Add to `src/lib/api.ts`
4. **New Context**: Create in `src/contexts/`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Next Steps

After the MVP is working, consider adding:

1. **Search Page**: Advanced search with filters
2. **Artwork Details Page**: Full artwork information
3. **User Profile Page**: Edit profile, view collections
4. **Museum Integration**: Connect with museum APIs
5. **Social Features**: Share collections, follow users
6. **Mobile App**: React Native version

## Support

For issues and questions:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Next.js documentation](https://nextjs.org/docs)
3. Check the issues in this repository

## License

This project is licensed under the MIT License.
