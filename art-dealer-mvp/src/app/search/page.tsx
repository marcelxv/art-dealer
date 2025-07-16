'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArtworkCard } from '@/components/artwork/ArtworkCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Artwork } from '@/lib/supabase'
import { fetchArtworks, ArtworkFilters } from '@/lib/api'
import { Search, Filter, X } from 'lucide-react'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<ArtworkFilters>({
    search: searchParams.get('q') || '',
    period: '',
    artist: '',
    museum: '',
  })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const searchArtworks = async (pageNum: number = 1, newFilters?: ArtworkFilters) => {
    try {
      setLoading(true)
      const currentFilters = newFilters || filters
      const response = await fetchArtworks(pageNum, 20, currentFilters)
      
      if (pageNum === 1) {
        setArtworks(response.data)
      } else {
        setArtworks(prev => [...prev, ...response.data])
      }
      
      setHasMore(pageNum < response.totalPages)
      setPage(pageNum)
      setTotalCount(response.count)
    } catch (error) {
      console.error('Error searching artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filters.search || filters.period || filters.artist || filters.museum) {
      searchArtworks()
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: searchQuery }
    setFilters(newFilters)
    searchArtworks(1, newFilters)
  }

  const handleFilterChange = (key: keyof ArtworkFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    searchArtworks(1, newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: ArtworkFilters = { search: '', period: '', artist: '', museum: '' }
    setFilters(clearedFilters)
    setSearchQuery('')
    setArtworks([])
    setTotalCount(0)
  }

  const handleLoadMore = () => {
    searchArtworks(page + 1)
  }

  const hasActiveFilters = filters.search || filters.period || filters.artist || filters.museum

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
              <Input
                type="text"
                placeholder="Search artworks, artists, museums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
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
                      onClick={() => handleFilterChange('search', '')}
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

        {/* Results */}
        <div className="mb-4">
          {hasActiveFilters && (
            <p className="text-gray-600">
              {loading ? 'Searching...' : `Found ${totalCount} result${totalCount !== 1 ? 's' : ''}`}
            </p>
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
                <Button onClick={handleLoadMore} disabled={loading} variant="outline">
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        ) : hasActiveFilters ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No artworks found.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
            <Button variant="ghost" onClick={handleClearFilters} className="mt-4">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Start your search above</p>
            <p className="text-gray-400 mt-2">Enter a search term or use filters to find artworks.</p>
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

 