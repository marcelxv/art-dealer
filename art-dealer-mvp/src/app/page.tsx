'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArtworkCard } from '@/components/artwork/ArtworkCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Artwork } from '@/lib/supabase'
import { fetchArtworks, ArtworkFilters } from '@/lib/api'
import { Search, Filter } from 'lucide-react'

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ArtworkFilters>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const loadArtworks = async (pageNum: number = 1, newFilters?: ArtworkFilters) => {
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
    } catch (error) {
      console.error('Error loading artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArtworks()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: searchQuery }
    setFilters(newFilters)
    loadArtworks(1, newFilters)
  }

  const handleLoadMore = () => {
    loadArtworks(page + 1)
  }

  const handleSearchClick = () => {
    router.push('/search')
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
              <Input
                type="text"
                placeholder="Search artworks, artists, museums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Button 
              variant="ghost" 
              onClick={handleSearchClick}
              className="mt-2 text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Search & Filters
            </Button>
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
                <Button onClick={handleLoadMore} disabled={loading} variant="outline">
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No artworks found.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
    </div>
  )
}
