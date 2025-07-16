import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Artwork {
  id: string
  title: string
  artist: string
  date?: string
  period?: string
  medium?: string
  dimensions?: string
  description?: string
  museum?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface UserCollection {
  id: string
  user_id: string
  artwork_id: string
  collection_type: 'want_to_see' | 'seen'
  notes?: string
  created_at: string
}

export type CollectionType = 'want_to_see' | 'seen' 