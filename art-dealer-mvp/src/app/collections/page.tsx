'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { ArtworkCard } from '@/components/artwork/ArtworkCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useCollections } from '@/contexts/CollectionsContext'
import { Heart, Eye, User } from 'lucide-react'

function CollectionsPageContent() {
  const { user } = useAuth()
  const { wantToSee, seen, loading } = useCollections()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'seen' ? 'seen' : 'want-to-see')

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              You need to sign in to view your collections.
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const currentCollection = activeTab === 'want-to-see' ? wantToSee : seen
  const currentCount = currentCollection.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Collections</h1>
          <p className="text-gray-600 mb-6">
            Manage your saved artworks and track what you&apos;ve seen
          </p>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'want-to-see' ? 'default' : 'outline'}
              onClick={() => setActiveTab('want-to-see')}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Want to See
              <Badge variant="secondary" className="ml-1">
                {wantToSee.length}
              </Badge>
            </Button>
            <Button
              variant={activeTab === 'seen' ? 'default' : 'outline'}
              onClick={() => setActiveTab('seen')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Seen
              <Badge variant="secondary" className="ml-1">
                {seen.length}
              </Badge>
            </Button>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Want to See</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wantToSee.length}</div>
              <p className="text-xs text-muted-foreground">
                Artworks in your wishlist
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seen</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{seen.length}</div>
              <p className="text-xs text-muted-foreground">
                Artworks you&apos;ve experienced
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wantToSee.length + seen.length}</div>
              <p className="text-xs text-muted-foreground">
                Total artworks collected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Collection Display */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {activeTab === 'want-to-see' ? 'Want to See' : 'Seen'} Collection
          </h2>
          <p className="text-gray-600 mt-1">
            {currentCount} artwork{currentCount !== 1 ? 's' : ''} in this collection
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
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
        ) : currentCollection.length > 0 ? (
          /* Artworks Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCollection.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              {activeTab === 'want-to-see' ? (
                <Heart className="h-16 w-16 text-gray-300" />
              ) : (
                <Eye className="h-16 w-16 text-gray-300" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No artworks in this collection
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'want-to-see'
                ? 'Start exploring artworks and save the ones you want to see!'
                : 'Mark artworks as seen when you visit them to track your art journey.'}
            </p>
            <Link href="/">
              <Button>Discover Artworks</Button>
            </Link>
          </div>
        )}

        {/* Collection Tips */}
        {currentCollection.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-3">Collection Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-900">Want to See:</strong> Save artworks you&apos;d like to visit in person. 
                  Perfect for planning museum trips!
                </div>
                <div>
                  <strong className="text-gray-900">Seen:</strong> Mark artworks you&apos;ve experienced to track your art journey 
                  and remember your favorites.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <CollectionsPageContent />
    </Suspense>
  )
} 