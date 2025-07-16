import { supabase, Artwork } from './supabase'

export interface ArtworkFilters {
  period?: string
  artist?: string
  museum?: string
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export async function fetchArtworks(
  page: number = 1,
  pageSize: number = 20,
  filters?: ArtworkFilters
): Promise<PaginatedResponse<Artwork>> {
  let query = supabase.from('artworks').select('*', { count: 'exact' })

  // Apply filters
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,artist.ilike.%${filters.search}%,museum.ilike.%${filters.search}%`
    )
  }
  if (filters?.period) {
    query = query.eq('period', filters.period)
  }
  if (filters?.artist) {
    query = query.ilike('artist', `%${filters.artist}%`)
  }
  if (filters?.museum) {
    query = query.ilike('museum', `%${filters.museum}%`)
  }

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    throw new Error(error.message)
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages,
  }
}

export async function fetchArtworkById(id: string): Promise<Artwork | null> {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw new Error(error.message)
  }

  return data
}

export async function searchArtworks(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<Artwork>> {
  return fetchArtworks(page, pageSize, { search: query })
}

// TODO: Implement getUniqueValues for filter options
// This function would be used to populate filter dropdowns
// but is not needed for the MVP 