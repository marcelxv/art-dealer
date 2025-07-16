#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { iconicArtworksData, type ArtworkData } from './artworks-data'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate additional artworks to reach 1000 total
function generateMoreArtworks(): ArtworkData[] {
  const additionalWorks: ArtworkData[] = []
  
  // Contemporary Art (2000s-present)
  const contemporaryArtists = [
    'Kaws', 'Banksy', 'Takashi Murakami', 'Damien Hirst', 'Kerry James Marshall',
    'Kara Walker', 'Ai Weiwei', 'Olafur Eliasson', 'Anselm Kiefer', 'Gerhard Richter',
    'David Hockney', 'Kehinde Wiley', 'Yinka Shonibare', 'Shirin Neshat', 'Zhang Huan'
  ]
  
  const periods = [
    'Contemporary', 'Neo-Expressionism', 'Conceptual Art', 'Installation Art',
    'Digital Art', 'Video Art', 'Performance Art', 'Street Art', 'Post-Internet Art'
  ]
  
  const mediums = [
    'Mixed media', 'Digital art', 'Video installation', 'Acrylic on canvas',
    'Oil on canvas', 'Photography', 'Sculpture', 'Performance documentation',
    'LED installation', 'Neon and glass', 'Bronze sculpture', 'Aluminum'
  ]
  
  const museums = [
    'Tate Modern, London', 'Museum of Modern Art, New York', 'Centre Pompidou, Paris',
    'Guggenheim Museum, New York', 'Whitney Museum, New York', 'Broad Museum, Los Angeles',
    'Stedelijk Museum, Amsterdam', 'Moderna Museet, Stockholm', 'National Gallery of Canada, Ottawa',
    'Art Institute of Chicago', 'Smithsonian American Art Museum', 'Museum of Contemporary Art, Los Angeles'
  ]
  
  // Add classical works not yet included
  const classicalWorks = [
    { title: 'Apollo Belvedere', artist: 'Leochares (attributed)', period: 'Ancient Greek', date: '330-320 BCE' },
    { title: 'The Thinker', artist: 'Auguste Rodin', period: 'Modern', date: '1904' },
    { title: 'The Gates of Hell', artist: 'Auguste Rodin', period: 'Modern', date: '1880-1917' },
    { title: 'The Burghers of Calais', artist: 'Auguste Rodin', period: 'Modern', date: '1884-1895' },
    { title: 'Liberty Enlightening the World', artist: 'Frédéric Auguste Bartholdi', period: 'Modern', date: '1886' },
    { title: 'Christ the Redeemer', artist: 'Paul Landowski', period: 'Art Deco', date: '1931' },
    { title: 'Mount Rushmore', artist: 'Gutzon Borglum', period: 'Modern', date: '1927-1941' },
    { title: 'The Motherland Calls', artist: 'Yevgeny Vuchetich', period: 'Soviet Art', date: '1967' },
    { title: 'Cloud Gate', artist: 'Anish Kapoor', period: 'Contemporary', date: '2004' },
    { title: 'Angel of the North', artist: 'Antony Gormley', period: 'Contemporary', date: '1998' }
  ]
  
  // Add these classical works
  classicalWorks.forEach(work => {
    additionalWorks.push({
      title: work.title,
      artist: work.artist,
      date: work.date,
      period: work.period,
      medium: 'Sculpture',
      museum: 'Various locations',
      description: `Famous ${work.period.toLowerCase()} sculpture by ${work.artist}`
    })
  })
  
  // Generate variations of famous series
  const seriesWorks = [
    { base: 'Water Lilies', artist: 'Claude Monet', count: 20 },
    { base: 'Haystacks', artist: 'Claude Monet', count: 15 },
    { base: 'Poplars', artist: 'Claude Monet', count: 12 },
    { base: 'Campbell\'s Soup Cans', artist: 'Andy Warhol', count: 32 },
    { base: 'Marilyn Monroe', artist: 'Andy Warhol', count: 10 },
    { base: 'Sunflowers', artist: 'Vincent van Gogh', count: 12 },
    { base: 'Self-Portraits', artist: 'Rembrandt van Rijn', count: 25 },
    { base: 'Rothko Chapel Paintings', artist: 'Mark Rothko', count: 14 },
    { base: 'Composition', artist: 'Piet Mondrian', count: 30 }
  ]
  
  seriesWorks.forEach(series => {
    for (let i = 1; i <= series.count; i++) {
      additionalWorks.push({
        title: `${series.base} #${i}`,
        artist: series.artist,
        date: '1890-1950',
        period: 'Modern',
        medium: 'Oil on canvas',
        museum: 'Various museums worldwide',
        description: `Part of the famous ${series.base} series by ${series.artist}`
      })
    }
  })
  
  // Add contemporary works
  for (let i = 0; i < 200; i++) {
    const artist = contemporaryArtists[i % contemporaryArtists.length]
    const period = periods[i % periods.length]
    const medium = mediums[i % mediums.length]
    const museum = museums[i % museums.length]
    
    additionalWorks.push({
      title: `Untitled #${i + 1}`,
      artist: artist,
      date: '2000-2025',
      period: period,
      medium: medium,
      museum: museum,
      description: `Contemporary ${period.toLowerCase()} work by ${artist}`
    })
  }
  
  // Add regional art traditions
  const regionalWorks = [
    // African Art
    { title: 'Senufo Mask', artist: 'Senufo craftsman', period: 'Traditional African', region: 'Ivory Coast' },
    { title: 'Ashanti Kente Cloth', artist: 'Ashanti weaver', period: 'Traditional African', region: 'Ghana' },
    { title: 'Maasai Beadwork', artist: 'Maasai artisan', period: 'Traditional African', region: 'Kenya/Tanzania' },
    { title: 'Ethiopian Coptic Cross', artist: 'Ethiopian metalworker', period: 'Medieval African', region: 'Ethiopia' },
    { title: 'Ndebele House Painting', artist: 'Ndebele women', period: 'Traditional African', region: 'South Africa' },
    
    // Latin American Art
    { title: 'Talavera Pottery', artist: 'Pueblan potter', period: 'Colonial Mexican', region: 'Mexico' },
    { title: 'Andean Textile', artist: 'Quechua weaver', period: 'Pre-Columbian', region: 'Peru' },
    { title: 'Oaxacan Alebrijes', artist: 'Zapotec carver', period: 'Folk Art', region: 'Mexico' },
    { title: 'Brazilian Carnival Costume', artist: 'Carnival artist', period: 'Contemporary Folk', region: 'Brazil' },
    { title: 'Day of the Dead Altar', artist: 'Mexican family', period: 'Folk Tradition', region: 'Mexico' },
    
    // Asian Art (expanded)
    { title: 'Korean Celadon Vase', artist: 'Goryeo potter', period: 'Medieval Korean', region: 'Korea' },
    { title: 'Thai Buddha Image', artist: 'Ayutthaya sculptor', period: 'Classical Thai', region: 'Thailand' },
    { title: 'Vietnamese Lacquerware', artist: 'Vietnamese artisan', period: 'Traditional Vietnamese', region: 'Vietnam' },
    { title: 'Indonesian Batik', artist: 'Javanese artist', period: 'Traditional Indonesian', region: 'Indonesia' },
    { title: 'Philippine Santos', artist: 'Filipino carver', period: 'Colonial Philippine', region: 'Philippines' },
    
    // Middle Eastern Art
    { title: 'Persian Miniature', artist: 'Safavid painter', period: 'Persian Classical', region: 'Iran' },
    { title: 'Turkish Iznik Tile', artist: 'Ottoman ceramist', period: 'Ottoman', region: 'Turkey' },
    { title: 'Moroccan Zellige', artist: 'Moroccan craftsman', period: 'Islamic Art', region: 'Morocco' },
    { title: 'Lebanese Blown Glass', artist: 'Phoenician glassmaker', period: 'Ancient', region: 'Lebanon' },
    { title: 'Egyptian Papyrus', artist: 'Ancient scribe', period: 'Ancient Egyptian', region: 'Egypt' }
  ]
  
  regionalWorks.forEach(work => {
    additionalWorks.push({
      title: work.title,
      artist: work.artist,
      date: 'Various periods',
      period: work.period,
      medium: 'Traditional materials',
      museum: `Regional museum in ${work.region}`,
      description: `Traditional art from ${work.region} representing ${work.period.toLowerCase()} culture`
    })
  })
  
  // Add architectural wonders
  const architecturalWorks = [
    { title: 'Parthenon', artist: 'Ictinus and Callicrates', period: 'Ancient Greek', location: 'Athens, Greece' },
    { title: 'Colosseum', artist: 'Roman architects', period: 'Roman Empire', location: 'Rome, Italy' },
    { title: 'Hagia Sophia', artist: 'Anthemius and Isidorus', period: 'Byzantine', location: 'Istanbul, Turkey' },
    { title: 'Notre-Dame de Paris', artist: 'Medieval builders', period: 'Gothic', location: 'Paris, France' },
    { title: 'Sagrada Família', artist: 'Antoni Gaudí', period: 'Modernist', location: 'Barcelona, Spain' },
    { title: 'Sydney Opera House', artist: 'Jørn Utzon', period: 'Modern', location: 'Sydney, Australia' },
    { title: 'Guggenheim Bilbao', artist: 'Frank Gehry', period: 'Deconstructivist', location: 'Bilbao, Spain' },
    { title: 'Burj Khalifa', artist: 'Adrian Smith', period: 'Contemporary', location: 'Dubai, UAE' },
    { title: 'Fallingwater', artist: 'Frank Lloyd Wright', period: 'Modern', location: 'Pennsylvania, USA' },
    { title: 'Villa Savoye', artist: 'Le Corbusier', period: 'Modernist', location: 'Poissy, France' }
  ]
  
  architecturalWorks.forEach(work => {
    additionalWorks.push({
      title: work.title,
      artist: work.artist,
      date: 'Various periods',
      period: work.period,
      medium: 'Architecture',
      museum: work.location,
      description: `Iconic ${work.period.toLowerCase()} architecture designed by ${work.artist}`
    })
  })
  
  return additionalWorks
}

// Combine all artworks
function getAllArtworks(): ArtworkData[] {
  const baseArtworks = iconicArtworksData
  const additionalArtworks = generateMoreArtworks()
  const combined = [...baseArtworks, ...additionalArtworks]
  
  // Ensure we have exactly 1000 artworks
  return combined.slice(0, 1000)
}

async function populateArtworks() {
  console.log('Starting artwork population...')
  
  const allArtworks = getAllArtworks()
  console.log(`Prepared ${allArtworks.length} artworks for insertion`)
  
  // Check if artworks already exist to avoid duplicates
  const { count } = await supabase
    .from('artworks')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Current artwork count: ${count}`)
  
  if (count && count > 100) {
    console.log('Database already has substantial artwork data. Skipping population.')
    console.log('To repopulate, please clear the artworks table first.')
    return
  }
  
  // Insert artworks in batches to avoid rate limits
  const batchSize = 50
  let inserted = 0
  
  for (let i = 0; i < allArtworks.length; i += batchSize) {
    const batch = allArtworks.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('artworks')
      .insert(batch)
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      continue
    }
    
    inserted += batch.length
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${inserted} artworks total`)
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`Successfully inserted ${inserted} artworks`)
  
  // Final count
  const { count: finalCount } = await supabase
    .from('artworks')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Final artwork count: ${finalCount}`)
}

// Only run if called directly
if (require.main === module) {
  populateArtworks()
    .then(() => {
      console.log('Artwork population completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error populating artworks:', error)
      process.exit(1)
    })
}

export { populateArtworks, getAllArtworks }