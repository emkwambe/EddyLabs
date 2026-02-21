/**
 * Seed auto repair pricing data
 * Run with: npx tsx scripts/run-seed.ts
 *
 * Prerequisites:
 * 1. Run the migration in Supabase dashboard: supabase/auto_repair_pricing_migration.sql
 * 2. Set environment variables in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { autoRepairPricingData } from './seed-auto-pricing.js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedPricingData() {
  console.log(`\n🚀 Seeding ${autoRepairPricingData.length} auto repair pricing records...\n`)

  // Check if table exists
  const { error: tableError } = await supabase
    .from('auto_repair_pricing')
    .select('id')
    .limit(1)

  if (tableError) {
    console.error('❌ Table "auto_repair_pricing" does not exist!')
    console.error('   Please run the migration first:')
    console.error('   1. Open Supabase Dashboard → SQL Editor')
    console.error('   2. Copy/paste: supabase/auto_repair_pricing_migration.sql')
    console.error('   3. Click "Run"')
    process.exit(1)
  }

  // Check if data already exists
  const { count } = await supabase
    .from('auto_repair_pricing')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) {
    console.log(`⚠️  Found ${count} existing pricing records`)
    console.log('   Delete existing records before re-seeding (optional)')
    console.log('')
  }

  // Insert pricing data in batches
  const batchSize = 100
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < autoRepairPricingData.length; i += batchSize) {
    const batch = autoRepairPricingData.slice(i, i + batchSize)

    const { data, error } = await supabase
      .from('auto_repair_pricing')
      .upsert(batch, { onConflict: 'service_type' })

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message)
      skipped += batch.length
    } else {
      inserted += batch.length
      console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}: Records ${i + 1}-${Math.min(i + batchSize, autoRepairPricingData.length)}`)
    }
  }

  console.log(`\n✅ Seed complete!`)
  console.log(`   Inserted/Updated: ${inserted} records`)
  if (skipped > 0) {
    console.log(`   Skipped: ${skipped} records`)
  }

  // Get summary stats
  const { data: stats } = await supabase
    .from('auto_repair_pricing')
    .select('service_category')

  if (stats) {
    const categories = Array.from(new Set(stats.map(s => s.service_category)))
    console.log(`\n📊 Summary:`)
    console.log(`   Total services: ${stats.length}`)
    console.log(`   Categories: ${categories.sort().join(', ')}`)
  }

  console.log('\n✨ Ready to use! The pricing database is populated.')
}

seedPricingData().catch(console.error)
