/**
 * Run database migration and seed pricing data
 * This script applies the auto repair pricing migration and seeds initial data
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { autoRepairPricingData } from './seed-auto-pricing'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  console.log('📋 Running database migration...')

  const migrationPath = path.join(__dirname, '../supabase/auto_repair_pricing_migration.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

  // Split by semicolon and filter out empty statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.includes('CREATE TABLE') ||
        statement.includes('CREATE INDEX') ||
        statement.includes('ALTER TABLE') ||
        statement.includes('CREATE POLICY') ||
        statement.includes('COMMENT ON')) {

      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        // Ignore errors for "already exists" type errors
        if (!error.message.includes('already exists')) {
          console.error(`⚠️  Error executing statement:`, error.message)
          console.error(`Statement: ${statement.substring(0, 100)}...`)
        }
      }
    }
  }

  console.log('✅ Migration completed')
}

async function seedPricingData() {
  console.log(`\n📊 Seeding ${autoRepairPricingData.length} pricing records...`)

  // Check if data already exists
  const { count } = await supabase
    .from('auto_repair_pricing')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) {
    console.log(`⚠️  Found ${count} existing records. Skipping seed.`)
    console.log('   To re-seed, delete existing records first.')
    return
  }

  // Insert pricing data in batches
  const batchSize = 50
  for (let i = 0; i < autoRepairPricingData.length; i += batchSize) {
    const batch = autoRepairPricingData.slice(i, i + batchSize)

    const { error } = await supabase
      .from('auto_repair_pricing')
      .insert(batch)

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message)
      process.exit(1)
    }

    console.log(`   Inserted records ${i + 1}-${Math.min(i + batchSize, autoRepairPricingData.length)}`)
  }

  console.log(`✅ Successfully seeded ${autoRepairPricingData.length} pricing records`)
}

async function main() {
  console.log('🚀 Starting database setup...\n')

  try {
    await runMigration()
    await seedPricingData()

    console.log('\n✨ Database setup complete!')
    console.log('\n📋 Summary:')
    console.log(`   - Migration: auto_repair_pricing_migration.sql`)
    console.log(`   - Pricing records: ${autoRepairPricingData.length}`)
    console.log(`   - Categories: brakes, engine, tires, battery, electrical, fluids, suspension, exhaust, hvac, transmission, cooling, diagnostic`)

  } catch (error) {
    console.error('\n❌ Setup failed:', error)
    process.exit(1)
  }
}

main()
