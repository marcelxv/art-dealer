'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, Eye, Calendar, MapPin, Palette, Ruler } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Artwork } from '@/lib/supabase'
import { fetchArtworkById } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useCollections } from '@/contexts/CollectionsContext'

export default function ArtworkDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const { addToWantToSee, markAsSeen, isInCollection } = useCollections()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const artworkData = await fetchArtworkById(id)
        
        if (artworkData) {
          setArtwork(artworkData)
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error('Error loading artwork:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadArtwork()
    }
  }, [params.id])

  const handleAddToWantToSee = async () => {
    if (!user || !artwork) return
    await addToWantToSee(artwork)
  }

  const handleMarkAsSeen = async () => {
    if (!user || !artwork) return
    await markAsSeen(artwork)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (notFound || !artwork) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artwork Not Found</h1>
            <p className="text-gray-600 mb-6">
              The artwork you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Discover
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const inWantToSee = isInCollection(artwork.id, 'want_to_see')
  const inSeen = isInCollection(artwork.id, 'seen')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Discover
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                {artwork.image_url && !imageError ? (
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    className={`object-cover transition-opacity duration-200 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true)
                      setImageLoading(false)
                    }}
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{artwork.artist}</p>
              
              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                {artwork.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{artwork.date}</span>
                  </div>
                )}
                {artwork.museum && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{artwork.museum}</span>
                  </div>
                )}
                {artwork.medium && (
                  <div className="flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    <span>{artwork.medium}</span>
                  </div>
                )}
                {artwork.dimensions && (
                  <div className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    <span>{artwork.dimensions}</span>
                  </div>
                )}
              </div>

              {/* Period Badge */}
              {artwork.period && (
                <div className="mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {artwork.period}
                  </Badge>
                </div>
              )}
            </div>

            {/* Description */}
            {artwork.description && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {user && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Add to Collection</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant={inWantToSee ? "default" : "outline"}
                      onClick={handleAddToWantToSee}
                      disabled={inWantToSee || inSeen}
                      className="w-full"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${inWantToSee ? 'fill-current' : ''}`} />
                      {inWantToSee ? 'Already Saved' : 'Want to See'}
                    </Button>
                    <Button
                      variant={inSeen ? "default" : "outline"}
                      onClick={handleMarkAsSeen}
                      disabled={inSeen}
                      className="w-full"
                    >
                      <Eye className={`h-4 w-4 mr-2 ${inSeen ? 'fill-current' : ''}`} />
                      {inSeen ? 'Already Seen' : 'Mark as Seen'}
                    </Button>
                  </div>
                  {(inWantToSee || inSeen) && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      This artwork is in your {inSeen ? 'Seen' : 'Want to See'} collection
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Artwork Details</h3>
                <dl className="grid grid-cols-1 gap-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                    <dd className="text-sm text-gray-900">{artwork.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Artist</dt>
                    <dd className="text-sm text-gray-900">{artwork.artist}</dd>
                  </div>
                  {artwork.date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900">{artwork.date}</dd>
                    </div>
                  )}
                  {artwork.period && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Period</dt>
                      <dd className="text-sm text-gray-900">{artwork.period}</dd>
                    </div>
                  )}
                  {artwork.medium && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Medium</dt>
                      <dd className="text-sm text-gray-900">{artwork.medium}</dd>
                    </div>
                  )}
                  {artwork.dimensions && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                      <dd className="text-sm text-gray-900">{artwork.dimensions}</dd>
                    </div>
                  )}
                  {artwork.museum && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Museum</dt>
                      <dd className="text-sm text-gray-900">{artwork.museum}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 