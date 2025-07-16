'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye, Calendar, MapPin } from 'lucide-react'
import { Artwork } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useCollections } from '@/contexts/CollectionsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ArtworkCardProps {
  artwork: Artwork
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { user } = useAuth()
  const { addToWantToSee, markAsSeen, isInCollection } = useCollections()
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const handleAddToWantToSee = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return
    await addToWantToSee(artwork)
  }

  const handleMarkAsSeen = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return
    await markAsSeen(artwork)
  }

  const inWantToSee = isInCollection(artwork.id, 'want_to_see')
  const inSeen = isInCollection(artwork.id, 'seen')

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/artwork/${artwork.id}`} className="block">
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
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200">
              <span className="text-gray-500 text-sm">No image available</span>
            </div>
          )}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {artwork.title}
          </h3>
          <p className="text-gray-600 mb-1">{artwork.artist}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {artwork.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{artwork.date}</span>
              </div>
            )}
            {artwork.museum && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{artwork.museum}</span>
              </div>
            )}
          </div>
          {artwork.period && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {artwork.period}
              </Badge>
            </div>
          )}
        </CardContent>
      </Link>
      {user && (
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant={inWantToSee ? "default" : "outline"}
              size="sm"
              onClick={handleAddToWantToSee}
              disabled={inWantToSee || inSeen}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 mr-2 ${inWantToSee ? 'fill-current' : ''}`} />
              {inWantToSee ? 'Saved' : 'Want to See'}
            </Button>
            <Button
              variant={inSeen ? "default" : "outline"}
              size="sm"
              onClick={handleMarkAsSeen}
              disabled={inSeen}
              className="flex-1"
            >
              <Eye className={`h-4 w-4 mr-2 ${inSeen ? 'fill-current' : ''}`} />
              {inSeen ? 'Seen' : 'Mark as Seen'}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
} 