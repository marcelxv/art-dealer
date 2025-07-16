'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArtworkCard } from '@/components/artwork/ArtworkCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Artwork } from '@/lib/supabase'
import { fetchArtworks, ArtworkFilters } from '@/lib/api'
import { Search, Filter, Loader2 } from 'lucide-react'

// Custom hook for debounced search (same as in search page)
function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ArtworkFilters>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const router = useRouter()

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounced(searchQuery, 300)

  const loadArtworks = useCallback(async (pageNum: number = 1, newFilters?: ArtworkFilters, isSearch: boolean = false) => {
    try {
      if (isSearch) {
        setSearchLoading(true)
      } else {
        setLoading(true)
      }
      
      const currentFilters = newFilters || filters
      const response = await fetchArtworks(pageNum, 20, currentFilters)
      
      if (pageNum === 1) {
        setArtworks(response.data)
      } else {
        setArtworks(prev => [...prev, ...response.data])
      }
      
      setHasMore(pageNum < response.totalPages)
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading artworks:', error)
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }, [filters])

  // Load initial artworks
  useEffect(() => {
    loadArtworks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // loadArtworks intentionally excluded to avoid infinite loop on initial load

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== (filters.search || '')) {
      const newFilters = { ...filters, search: debouncedSearchQuery }
      setFilters(newFilters)
      loadArtworks(1, newFilters, true)
    }
  }, [debouncedSearchQuery, filters, loadArtworks])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by debounced effect, but we can trigger immediate search
    const newFilters = { ...filters, search: searchQuery }
    setFilters(newFilters)
    loadArtworks(1, newFilters, true)
  }

  const handleLoadMore = () => {
    loadArtworks(page + 1)
  }

  const handleAdvancedSearch = () => {
    // Navigate to search page with current query if any
    const searchParams = new URLSearchParams()
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery.trim())
    }
    const url = searchParams.toString() ? `/search?${searchParams.toString()}` : '/search'
    router.push(url)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    const newFilters = { ...filters, search: '' }
    setFilters(newFilters)
    loadArtworks(1, newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Art</h1>
          <p className="text-gray-600 mb-6">
            Explore thousands of artworks from museums around the world
          </p>
          
          {/* Quick Search */}
          <div className="max-w-md">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search artworks, artists, museums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pr-10"
                />
                {searchLoading && searchQuery && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}
              </div>
              <Button type="submit" variant="outline" disabled={searchLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            {/* Search status and actions */}
            <div className="flex items-center justify-between mt-2">
              <Button 
                variant="ghost" 
                onClick={handleAdvancedSearch}
                className="text-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Search & Filters
              </Button>
              
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear search
                </Button>
              )}
            </div>
            
            {/* Active search indicator */}
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-600">
                {searchLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Searching for &ldquo;{searchQuery}&rdquo;...
                  </span>
                ) : (
                  <span>Showing results for &ldquo;{searchQuery}&rdquo;</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Artwork Grid */}
        {loading && artworks.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : artworks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={loading} 
                  variant="outline"
                  className="min-w-32"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <Search className="w-full h-full" />
              </div>
              {searchQuery ? (
                <>
                  <p className="text-gray-500 text-lg mb-2">No artworks found</p>
                  <p className="text-gray-400 mb-4">
                    No results found for &ldquo;{searchQuery}&rdquo;. Try different keywords or use advanced search.
                  </p>
                  <Button variant="ghost" onClick={handleClearSearch}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg mb-2">Discover amazing artworks</p>
                  <p className="text-gray-400">
                    Search above to explore our collection of iconic artworks from museums worldwide.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
