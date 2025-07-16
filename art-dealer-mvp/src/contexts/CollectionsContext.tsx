'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, Artwork, CollectionType } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface CollectionWithArtwork {
  id: string
  user_id: string
  artwork_id: string
  collection_type: CollectionType
  notes?: string
  created_at: string
  artworks: Artwork
}

interface CollectionsContextType {
  wantToSee: Artwork[]
  seen: Artwork[]
  loading: boolean
  addToWantToSee: (artwork: Artwork) => Promise<void>
  markAsSeen: (artwork: Artwork) => Promise<void>
  removeFromCollection: (artworkId: string, type: CollectionType) => Promise<void>
  isInCollection: (artworkId: string, type: CollectionType) => boolean
  refreshCollections: () => Promise<void>
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined)

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [wantToSee, setWantToSee] = useState<Artwork[]>([])
  const [seen, setSeen] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCollections()
    } else {
      setWantToSee([])
      setSeen([])
    }
  }, [user])

  const fetchCollections = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch user collections with artwork data
      const { data: collections, error } = await supabase
        .from('user_collections')
        .select(`
          *,
          artworks:artwork_id (*)
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching collections:', error)
        return
      }

      // Separate collections by type
      const wantToSeeArtworks: Artwork[] = []
      const seenArtworks: Artwork[] = []

      collections?.forEach((collection: CollectionWithArtwork) => {
        if (collection.artworks) {
          if (collection.collection_type === 'want_to_see') {
            wantToSeeArtworks.push(collection.artworks)
          } else if (collection.collection_type === 'seen') {
            seenArtworks.push(collection.artworks)
          }
        }
      })

      setWantToSee(wantToSeeArtworks)
      setSeen(seenArtworks)
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToWantToSee = async (artwork: Artwork) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_collections')
        .insert([
          {
            user_id: user.id,
            artwork_id: artwork.id,
            collection_type: 'want_to_see',
          },
        ])

      if (error) {
        console.error('Error adding to want to see:', error)
        return
      }

      setWantToSee(prev => [...prev, artwork])
    } catch (error) {
      console.error('Error adding to want to see:', error)
    }
  }

  const markAsSeen = async (artwork: Artwork) => {
    if (!user) return

    try {
      // Remove from want to see if it exists
      await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('artwork_id', artwork.id)
        .eq('collection_type', 'want_to_see')

      // Add to seen collection
      const { error } = await supabase
        .from('user_collections')
        .insert([
          {
            user_id: user.id,
            artwork_id: artwork.id,
            collection_type: 'seen',
          },
        ])

      if (error) {
        console.error('Error marking as seen:', error)
        return
      }

      setWantToSee(prev => prev.filter(item => item.id !== artwork.id))
      setSeen(prev => [...prev, artwork])
    } catch (error) {
      console.error('Error marking as seen:', error)
    }
  }

  const removeFromCollection = async (artworkId: string, type: CollectionType) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('artwork_id', artworkId)
        .eq('collection_type', type)

      if (error) {
        console.error('Error removing from collection:', error)
        return
      }

      if (type === 'want_to_see') {
        setWantToSee(prev => prev.filter(item => item.id !== artworkId))
      } else if (type === 'seen') {
        setSeen(prev => prev.filter(item => item.id !== artworkId))
      }
    } catch (error) {
      console.error('Error removing from collection:', error)
    }
  }

  const isInCollection = (artworkId: string, type: CollectionType): boolean => {
    if (type === 'want_to_see') {
      return wantToSee.some(item => item.id === artworkId)
    } else if (type === 'seen') {
      return seen.some(item => item.id === artworkId)
    }
    return false
  }

  const refreshCollections = async () => {
    await fetchCollections()
  }

  const value = {
    wantToSee,
    seen,
    loading,
    addToWantToSee,
    markAsSeen,
    removeFromCollection,
    isInCollection,
    refreshCollections,
  }

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  )
}

export function useCollections() {
  const context = useContext(CollectionsContext)
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider')
  }
  return context
} 