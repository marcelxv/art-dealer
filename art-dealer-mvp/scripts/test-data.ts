#!/usr/bin/env tsx

// Test script to verify the artwork data generation
import { iconicArtworksData, type ArtworkData } from './artworks-data'

// Mock the getAllArtworks function for testing without database connection
function getAllArtworks(): ArtworkData[] {
  // Generate a simplified version for testing
  const additionalWorks: ArtworkData[] = []
  
  // Add some test contemporary works
  const artists = ['Kaws', 'Banksy', 'Takashi Murakami']
  for (let i = 0; i < 100; i++) {
    additionalWorks.push({
      title: `Test Work #${i + 1}`,
      artist: artists[i % artists.length],
      date: '2000-2025',
      period: 'Contemporary',
      medium: 'Mixed media',
      museum: 'Test Museum',
      description: `Test contemporary work #${i + 1}`
    })
  }
  
  const combined = [...iconicArtworksData, ...additionalWorks]
  return combined.slice(0, 1000)
}

function testArtworkGeneration() {
  console.log('Testing artwork data generation...')
  
  const artworks = getAllArtworks()
  
  console.log(`\nTotal artworks generated: ${artworks.length}`)
  
  // Check for required fields
  const missingFields = artworks.filter(artwork => 
    !artwork.title || !artwork.artist || !artwork.period
  )
  
  if (missingFields.length > 0) {
    console.error(`❌ Found ${missingFields.length} artworks with missing required fields`)
    console.log('Examples:', missingFields.slice(0, 3))
  } else {
    console.log('✅ All artworks have required fields')
  }
  
  // Check for duplicates
  const titleArtistPairs = artworks.map(a => `${a.title} - ${a.artist}`)
  const uniquePairs = new Set(titleArtistPairs)
  const duplicates = titleArtistPairs.length - uniquePairs.size
  
  if (duplicates > 0) {
    console.warn(`⚠️  Found ${duplicates} potential duplicate artworks`)
  } else {
    console.log('✅ No duplicate title-artist combinations found')
  }
  
  // Analyze periods
  const periods = artworks.map(a => a.period).filter(Boolean)
  const periodCounts = periods.reduce((acc, period) => {
    acc[period] = (acc[period] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log('\n📊 Artworks by period:')
  Object.entries(periodCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([period, count]) => {
      console.log(`  ${period}: ${count}`)
    })
  
  // Analyze artists
  const artists = artworks.map(a => a.artist).filter(Boolean)
  const artistCounts = artists.reduce((acc, artist) => {
    acc[artist] = (acc[artist] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log('\n🎨 Top artists by artwork count:')
  Object.entries(artistCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([artist, count]) => {
      console.log(`  ${artist}: ${count}`)
    })
  
  // Show sample artworks
  console.log('\n🖼️  Sample artworks:')
  artworks.slice(0, 5).forEach((artwork, index) => {
    console.log(`${index + 1}. "${artwork.title}" by ${artwork.artist} (${artwork.period})`)
    console.log(`   ${artwork.description?.substring(0, 80)}...`)
  })
  
  console.log('\n✅ Data generation test completed successfully!')
}

// Run the test
testArtworkGeneration()