/**
 * Parts Markup Calculator
 * Analyzes parts pricing against OEM costs to identify excessive markups
 */

import { createClient } from '@/lib/supabase/server'
import type { LineItem, VehicleInfo, PartsMarkupAnalysis } from '@/lib/types'

/**
 * Analyze parts markup in an auto repair estimate
 * Compares shop's parts pricing to OEM costs
 */
export async function analyzePartsMarkup(
  lineItems: LineItem[],
  vehicleInfo?: VehicleInfo | null
): Promise<PartsMarkupAnalysis | null> {
  if (lineItems.length === 0) {
    return null
  }

  try {
    const supabase = await createClient()

    // Identify parts-related line items
    const partsItems = identifyPartsLineItems(lineItems)

    if (partsItems.length === 0) {
      return null
    }

    let totalPartsCharged = 0
    let estimatedOEMCost = 0
    const excessiveMarkupItems: Array<{
      description: string
      chargedPrice: number
      oemPrice: number
      markupPercentage: number
    }> = []

    // Analyze each parts line item
    for (const item of partsItems) {
      const chargedPrice = item.line_total || 0
      totalPartsCharged += chargedPrice

      // Try to find OEM pricing in our database
      const oemPricing = await findOEMPricing(item, vehicleInfo, supabase)

      if (oemPricing) {
        const oemPrice = (oemPricing.oem_price_min + oemPricing.oem_price_max) / 2
        estimatedOEMCost += oemPrice

        // Calculate markup percentage
        const markupPercentage = Math.round(((chargedPrice - oemPrice) / oemPrice) * 100)

        // Flag items with >100% markup as excessive
        if (markupPercentage > 100) {
          excessiveMarkupItems.push({
            description: item.description,
            chargedPrice,
            oemPrice,
            markupPercentage,
          })
        }
      } else {
        // Estimate OEM cost using conservative 50% markup assumption
        const estimatedOEM = chargedPrice / 1.5
        estimatedOEMCost += estimatedOEM
      }
    }

    // Calculate average markup percentage
    const averageMarkupPercentage =
      estimatedOEMCost > 0
        ? Math.round(((totalPartsCharged - estimatedOEMCost) / estimatedOEMCost) * 100)
        : 0

    // Calculate total excessive markup (amount above reasonable 60% markup)
    const reasonableTotal = estimatedOEMCost * 1.6 // 60% markup
    const totalExcessiveMarkup = Math.max(0, totalPartsCharged - reasonableTotal)

    // Determine confidence based on how many parts we found OEM pricing for
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
    const matchedItems = partsItems.filter((item) => {
      // Check if we found this item in excessive markup (means we had OEM data)
      return excessiveMarkupItems.some((excessive) => excessive.description === item.description)
    })

    if (matchedItems.length >= partsItems.length * 0.7) {
      confidence = 'HIGH'
    } else if (matchedItems.length >= partsItems.length * 0.4) {
      confidence = 'MEDIUM'
    }

    return {
      totalPartsCharged,
      estimatedOEMCost,
      averageMarkupPercentage,
      excessiveMarkupItems,
      totalExcessiveMarkup,
      confidence,
    }
  } catch (error) {
    console.error('Parts markup analysis error:', error)
    return null
  }
}

/**
 * Identify parts-related line items (non-labor)
 */
function identifyPartsLineItems(lineItems: LineItem[]): LineItem[] {
  const partsKeywords = [
    'part',
    'parts',
    'pad',
    'pads',
    'rotor',
    'rotors',
    'filter',
    'oil',
    'fluid',
    'coolant',
    'brake',
    'battery',
    'tire',
    'tires',
    'belt',
    'hose',
    'plug',
    'plugs',
    'wire',
    'wires',
    'sensor',
    'bulb',
    'fuse',
    'pump',
    'alternator',
    'starter',
    'radiator',
    'compressor',
    'condenser',
    'evaporator',
    'strut',
    'shock',
    'spring',
    'bushing',
    'bearing',
    'seal',
    'gasket',
  ]

  const laborKeywords = [
    'labor',
    'labour',
    'service fee',
    'diagnostic',
    'installation',
    'shop supplies',
    'hazardous',
    'disposal',
    'environmental',
  ]

  return lineItems.filter((item) => {
    const desc = item.description.toLowerCase()

    // Exclude labor and fees
    if (laborKeywords.some((keyword) => desc.includes(keyword))) {
      return false
    }

    // Include if contains parts keywords
    return partsKeywords.some((keyword) => desc.includes(keyword))
  })
}

/**
 * Find OEM pricing for a parts line item in our reference database
 */
async function findOEMPricing(
  item: LineItem,
  vehicleInfo: VehicleInfo | null | undefined,
  supabase: any
): Promise<{
  oem_price_min: number
  oem_price_max: number
  typical_markup_percentage: number
} | null> {
  const desc = item.description.toLowerCase()

  // Determine part category from description
  const partCategory = categorizePart(desc)
  if (!partCategory) {
    return null
  }

  // Build query based on available vehicle info
  let query = supabase
    .from('parts_pricing_reference')
    .select('oem_price_min, oem_price_max, typical_markup_percentage')
    .eq('part_category', partCategory)

  // Filter by make/model if available
  if (vehicleInfo?.make) {
    query = query.or(`make.is.null,make.eq.${vehicleInfo.make}`)
  }

  if (vehicleInfo?.model) {
    query = query.or(`model.is.null,model.eq.${vehicleInfo.model}`)
  }

  // Filter by year range if available
  if (vehicleInfo?.year) {
    query = query
      .or(`year_min.is.null,year_min.lte.${vehicleInfo.year}`)
      .or(`year_max.is.null,year_max.gte.${vehicleInfo.year}`)
  }

  const { data, error } = await query.limit(1).single()

  if (error || !data) {
    return null
  }

  return {
    oem_price_min: parseFloat(data.oem_price_min),
    oem_price_max: parseFloat(data.oem_price_max),
    typical_markup_percentage: parseInt(data.typical_markup_percentage),
  }
}

/**
 * Categorize a part based on description keywords
 */
function categorizePart(description: string): string | null {
  const categories: Record<string, string[]> = {
    brake_pad: ['brake pad', 'brake pads'],
    brake_rotor: ['brake rotor', 'brake rotors', 'brake disc'],
    oil_filter: ['oil filter'],
    air_filter: ['air filter', 'cabin filter', 'engine air filter'],
    spark_plug: ['spark plug', 'spark plugs'],
    battery: ['battery', 'car battery'],
    alternator: ['alternator'],
    starter: ['starter', 'starter motor'],
    radiator: ['radiator'],
    water_pump: ['water pump'],
    fuel_pump: ['fuel pump'],
    timing_belt: ['timing belt', 'timing chain'],
    serpentine_belt: ['serpentine belt', 'drive belt', 'accessory belt'],
    tire: ['tire', 'tires'],
    shock_absorber: ['shock', 'shocks', 'shock absorber'],
    strut: ['strut', 'struts'],
    control_arm: ['control arm'],
    ball_joint: ['ball joint'],
    tie_rod: ['tie rod'],
    cv_axle: ['cv axle', 'cv joint', 'axle'],
    wheel_bearing: ['wheel bearing', 'hub bearing'],
    brake_caliper: ['brake caliper', 'caliper'],
    master_cylinder: ['master cylinder'],
    thermostat: ['thermostat'],
    oxygen_sensor: ['oxygen sensor', 'o2 sensor'],
    catalytic_converter: ['catalytic converter', 'cat converter'],
    muffler: ['muffler'],
    exhaust_pipe: ['exhaust pipe'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => description.includes(keyword))) {
      return category
    }
  }

  return null
}
