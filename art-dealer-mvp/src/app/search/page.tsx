'use client'

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArtworkCard } from '@/components/artwork/ArtworkCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Artwork } from '@/lib/supabase'
import { fetchArtworks, ArtworkFilters } from '@/lib/api'
import { Search, Filter, X, Loader2 } from 'lucide-react'

// Custom hook for URL state management
function useURLState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateURL = useCallback((filters: ArtworkFilters, page?: number) => {
    const params = new URLSearchParams()
    
    // Only add non-empty values to URL
    if (filters.search?.trim()) params.set('q', filters.search.trim())
    if (filters.period?.trim()) params.set('period', filters.period.trim())
    if (filters.artist?.trim()) params.set('artist', filters.artist.trim())
    if (filters.museum?.trim()) params.set('museum', filters.museum.trim())
    if (page && page > 1) params.set('page', page.toString())

    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname

    // Use replace for filter changes to avoid cluttering browser history
    router.replace(url, { scroll: false })
  }, [router, pathname])

  const getFiltersFromURL = useCallback((): ArtworkFilters & { page: number } => {
    return {
      search: searchParams.get('q') || '',
      period: searchParams.get('period') || '',
      artist: searchParams.get('artist') || '',
      museum: searchParams.get('museum') || '',
      page: parseInt(searchParams.get('page') || '1', 10)
    }
  }, [searchParams])

  return { updateURL, getFiltersFromURL }
}

// Custom hook for debounced search
function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

function SearchPageContent() {
  const { updateURL, getFiltersFromURL } = useURLState()
  
  // Initialize state from URL
  const initialState = useMemo(() => getFiltersFromURL(), [getFiltersFromURL])
  
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialState.search)
  const [filters, setFilters] = useState<ArtworkFilters>({
    search: initialState.search,
    period: initialState.period,
    artist: initialState.artist,
    museum: initialState.museum,
  })
  const [page, setPage] = useState(initialState.page)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounced(searchQuery, 300)

  // Update search filter when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== filters.search) {
      setFilters(prev => ({ ...prev, search: debouncedSearchQuery }))
    }
  }, [debouncedSearchQuery, filters.search])

  const searchArtworks = useCallback(async (
    pageNum: number = 1, 
    searchFilters?: ArtworkFilters,
    shouldReset: boolean = true
  ) => {
    try {
      setLoading(true)
      const currentFilters = searchFilters || filters
      const response = await fetchArtworks(pageNum, 20, currentFilters)
      
      if (shouldReset || pageNum === 1) {
        setArtworks(response.data)
      } else {
        setArtworks(prev => [...prev, ...response.data])
      }
      
      setHasMore(pageNum < response.totalPages)
      setPage(pageNum)
      setTotalCount(response.count)

      // Update URL with current filters and page
      updateURL(currentFilters, pageNum > 1 ? pageNum : undefined)
    } catch (error) {
      console.error('Error searching artworks:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, updateURL])

  // Search when filters change (but not on initial load if no filters)
  useEffect(() => {
    const hasActiveFilters = filters.search || filters.period || filters.artist || filters.museum
    
    if (hasActiveFilters) {
      searchArtworks(1, filters, true)
    } else if (artworks.length > 0) {
      // Clear results if no filters and we had results before
      setArtworks([])
      setTotalCount(0)
      updateURL(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]) // searchArtworks and updateURL intentionally excluded to avoid infinite loop

  // Handle form submission (for explicit search button clicks)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: searchQuery }
    setFilters(newFilters)
    searchArtworks(1, newFilters, true)
  }

  const handleFilterChange = (key: keyof ArtworkFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // For non-search filters, update immediately
    if (key !== 'search') {
      searchArtworks(1, newFilters, true)
    }
  }

  const handleClearFilters = () => {
    const clearedFilters: ArtworkFilters = { search: '', period: '', artist: '', museum: '' }
    setFilters(clearedFilters)
    setSearchQuery('')
    setArtworks([])
    setTotalCount(0)
    setPage(1)
    updateURL(clearedFilters)
  }

  const handleLoadMore = () => {
    searchArtworks(page + 1, filters, false)
  }

  const hasActiveFilters = filters.search || filters.period || filters.artist || filters.museum

  // Auto-expand filters if there are filter params in URL
  useEffect(() => {
    if (filters.period || filters.artist || filters.museum) {
      setShowFilters(true)
    }
  }, [filters.period, filters.artist, filters.museum])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Artworks</h1>
          <p className="text-gray-600 mb-6">
            Find artworks by title, artist, museum, or use advanced filters
          </p>
          
          {/* Search Form */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search artworks, artists, museums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pr-10"
                />
                {loading && searchQuery && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.period || filters.artist || filters.museum) && (
                  <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {[filters.period, filters.artist, filters.museum].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </form>

            {/* Advanced Filters */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="period">Period</Label>
                      <Input
                        id="period"
                        type="text"
                        placeholder="e.g., Renaissance, Baroque"
                        value={filters.period || ''}
                        onChange={(e) => handleFilterChange('period', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artist">Artist</Label>
                      <Input
                        id="artist"
                        type="text"
                        placeholder="e.g., Van Gogh, Picasso"
                        value={filters.artist || ''}
                        onChange={(e) => handleFilterChange('artist', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="museum">Museum</Label>
                      <Input
                        id="museum"
                        type="text"
                        placeholder="e.g., Louvre, MoMA"
                        value={filters.museum || ''}
                        onChange={(e) => handleFilterChange('museum', e.target.value)}
                      />
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <div className="mt-4">
                      <Button variant="ghost" onClick={handleClearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>Search: &ldquo;{filters.search}&rdquo;</span>
                    <button 
                      onClick={() => {
                        setSearchQuery('')
                        handleFilterChange('search', '')
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.period && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <span>Period: {filters.period}</span>
                    <button 
                      onClick={() => handleFilterChange('period', '')}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.artist && (
                  <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <span>Artist: {filters.artist}</span>
                    <button 
                      onClick={() => handleFilterChange('artist', '')}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.museum && (
                  <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    <span>Museum: {filters.museum}</span>
                    <button 
                      onClick={() => handleFilterChange('museum', '')}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Results Count */}
        <div className="mb-4">
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <p className="text-gray-600">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  `Found ${totalCount.toLocaleString()} result${totalCount !== 1 ? 's' : ''}`
                )}
              </p>
              {page > 1 && (
                <span className="text-sm text-gray-500">
                  (Page {page})
                </span>
              )}
            </div>
          )}
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
        ) : hasActiveFilters ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <Search className="w-full h-full" />
              </div>
              <p className="text-gray-500 text-lg mb-2">No artworks found</p>
              <p className="text-gray-400 mb-4">
                Try adjusting your search terms or filters to find more results.
              </p>
              <Button variant="ghost" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <Search className="w-full h-full" />
              </div>
              <p className="text-gray-500 text-lg mb-2">Discover amazing artworks</p>
              <p className="text-gray-400">
                Enter a search term or use filters above to explore our collection of iconic artworks.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}