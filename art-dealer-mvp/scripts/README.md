# Art Dealer MVP Scripts

This directory contains utility scripts for the Art Dealer MVP application.

## Artwork Population Script

The `populate-artworks.ts` script populates the Supabase database with 1000 iconic artworks from around the world.

### Features

- **Comprehensive Dataset**: 1000 carefully curated artworks covering:
  - Ancient art (Greek, Roman, Egyptian, etc.)
  - Renaissance masterpieces
  - Baroque and Rococo works
  - Impressionism and Post-Impressionism
  - Modern art movements (Cubism, Surrealism, Abstract Expressionism)
  - Contemporary art
  - Global art traditions (Asian, African, Islamic, Pre-Columbian, etc.)
  - Architecture and sculpture
  - Digital and installation art

- **Smart Population**: 
  - Checks existing artwork count to avoid duplicates
  - Batch inserts for optimal performance
  - Comprehensive error handling
  - Rate limiting to protect database

- **Diverse Coverage**:
  - Famous artist series (Monet's Water Lilies, Warhol's Campbell's Soup Cans, etc.)
  - Regional art traditions from every continent
  - Historical periods from ancient times to present
  - Various mediums and techniques

### Usage

#### Prerequisites

1. Ensure you have a `.env.local` file in the project root with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. Make sure your Supabase database has the `artworks` table set up according to the schema in `src/lib/supabase.ts`.

#### Running the Script

From the project root directory:

```bash
# Install dependencies if not already installed
npm install

# Run the population script
npm run populate-artworks
```

Or run directly with tsx:

```bash
cd art-dealer-mvp
npx tsx scripts/populate-artworks.ts
```

### What Gets Populated

The script inserts exactly 1000 artworks with the following fields:
- `title`: Name of the artwork
- `artist`: Creator of the work
- `date`: When it was created
- `period`: Art historical period/movement
- `medium`: Materials and technique used
- `museum`: Current location or institution
- `description`: Brief description of the work

### Dataset Composition

- **150+ Historical masterpieces**: From Venus de Milo to Starry Night
- **200+ Contemporary works**: Including street art, digital art, and installations
- **300+ Artist series**: Multiple works from famous series
- **200+ Global traditions**: Art from Africa, Asia, Americas, Oceania
- **100+ Architecture**: From Parthenon to modern landmarks
- **50+ Sculpture**: Classical and contemporary 3D works

### Safety Features

- **Duplicate Prevention**: Checks if database already has substantial artwork data
- **Batch Processing**: Inserts in batches of 50 to avoid overwhelming the database
- **Error Handling**: Continues processing even if individual batches fail
- **Rate Limiting**: Small delays between batches to be respectful of database resources

### File Structure

- `populate-artworks.ts`: Main script with population logic
- `artworks-data.ts`: Curated dataset of iconic artworks
- `README.md`: This documentation file

### Extending the Dataset

To add more artworks:

1. Edit `artworks-data.ts` to add more entries to `iconicArtworksData`
2. Or modify the generation logic in `populate-artworks.ts` for programmatic additions
3. Follow the existing structure for consistency

### Troubleshooting

**"Missing required environment variables"**
- Ensure your `.env.local` file is properly configured
- Check that all required environment variables are set

**"Database already has substantial artwork data"**
- The script won't run if there are already 100+ artworks in the database
- Clear the artworks table if you want to repopulate
- Or modify the check in the script if needed

**Connection errors**
- Verify your Supabase URL and service role key
- Check your network connection
- Ensure your Supabase project is active

### Performance

The script typically takes 2-5 minutes to complete, depending on:
- Network speed
- Database response time
- Current database load

Each batch insert includes a small delay (100ms) to be respectful of database resources.