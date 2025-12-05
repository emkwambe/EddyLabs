/**
 * Price Comparison and Service Necessity Analysis
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { ExtractedFields, PriceComparison, VehicleInfo } from '@/lib/types'
import { getComprehensivePricing } from '@/lib/api/externalApis'

interface ServiceNecessityCheck {
  service: string
  isNecessary: boolean
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  reasoning: string
  potentialSavings: number
}

/**
 * Compare estimate prices against market benchmarks
 */
export async function comparePrices(
  extractedFields: ExtractedFields,
  documentType: string
): Promise<PriceComparison | null> {
  // Only perform price comparison for auto repairs (for now)
  if (documentType !== 'ESTIMATE_AUTO' || !extractedFields.total_cost) {
    return null
  }

  try {
    const supabase = await createServiceClient()

    // Get price benchmarks for each line item
    let fairPriceMin = 0
    let fairPriceMax = 0
    let foundBenchmarks = false
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'

    for (const item of extractedFields.line_items) {
      // Try external APIs first (RepairPal, etc.)
      const externalPricing = await getComprehensivePricing(
        item.description,
        extractedFields.shop_info?.zip_code || undefined
      )

      if (externalPricing.hasPricing) {
        // Use external pricing if available
        fairPriceMin += externalPricing.localMin || externalPricing.nationalMin
        fairPriceMax += externalPricing.localMax || externalPricing.nationalMax
        foundBenchmarks = true
        confidence = externalPricing.confidence
      } else {
        // Fall back to internal database benchmarks
        const { data, error } = await supabase.rpc('get_price_benchmark', {
          p_service_name: item.description,
          p_vehicle_type: 'sedan' // Default to sedan, could be enhanced with vehicle_info
        })

        if (!error && data && data.length > 0 && data[0].found) {
          fairPriceMin += data[0].price_min || 0
          fairPriceMax += data[0].price_max || 0
          foundBenchmarks = true
          confidence = 'MEDIUM'
        }
      }
    }

    if (!foundBenchmarks) {
      // Fallback: Use conservative estimate based on typical markups
      // Auto repair shops typically mark up 40-60% on parts, $80-120/hr for labor
      fairPriceMin = extractedFields.total_cost * 0.6
      fairPriceMax = extractedFields.total_cost * 0.8

      return {
        estimateTotal: extractedFields.total_cost,
        fairPriceMin,
        fairPriceMax,
        isOverpriced: extractedFields.total_cost > fairPriceMax,
        potentialOvercharge: Math.max(0, extractedFields.total_cost - fairPriceMax),
        confidence: 'LOW',
      }
    }

    // Add reasonable fee range (3-5% of subtotal)
    const subtotal = fairPriceMax
    fairPriceMin += subtotal * 0.03
    fairPriceMax += subtotal * 0.05

    const isOverpriced = extractedFields.total_cost > fairPriceMax
    const potentialOvercharge = Math.max(0, extractedFields.total_cost - fairPriceMax)

    return {
      estimateTotal: extractedFields.total_cost,
      fairPriceMin: Math.round(fairPriceMin * 100) / 100,
      fairPriceMax: Math.round(fairPriceMax * 100) / 100,
      isOverpriced,
      potentialOvercharge: Math.round(potentialOvercharge * 100) / 100,
      confidence,
    }
  } catch (error) {
    console.error('Price comparison error:', error)
    return null
  }
}

/**
 * Check if services are necessary based on mileage and maintenance schedules
 */
export async function checkServiceNecessity(
  extractedFields: ExtractedFields,
  documentType: string
): Promise<ServiceNecessityCheck[]> {
  // Only check service necessity for auto repairs
  if (documentType !== 'ESTIMATE_AUTO' || !extractedFields.vehicle_info?.mileage) {
    return []
  }

  const checks: ServiceNecessityCheck[] = []
  const vehicleInfo = extractedFields.vehicle_info
  const mileage = vehicleInfo.mileage || 0

  try {
    const supabase = await createServiceClient()

    // Check each service against maintenance schedule
    for (const item of extractedFields.line_items) {
      const serviceName = item.description.toLowerCase()

      // Check rear brakes specifically (common upsell)
      if (serviceName.includes('rear brake')) {
        const { data: scheduleData } = await supabase
          .from('maintenance_schedules')
          .select('*')
          .ilike('service_name', '%rear brake%')
          .lte('year_min', vehicleInfo.year || 9999)
          .gte('year_max', vehicleInfo.year || 0)
          .limit(1)
          .single()

        if (scheduleData) {
          const typicalMileage = scheduleData.typical_mileage
          if (mileage < typicalMileage * 0.6) {
            // Less than 60% of typical mileage - likely unnecessary
            checks.push({
              service: item.description,
              isNecessary: false,
              confidence: 'HIGH',
              reasoning: `Rear brake pads typically last ${typicalMileage.toLocaleString()} miles. At ${mileage.toLocaleString()} miles, they're likely only 40-50% worn.`,
              potentialSavings: item.line_total || 0,
            })
          }
        }
      }

      // Check for rotor replacement vs resurfacing
      if (serviceName.includes('rotor') && serviceName.includes('replacement')) {
        checks.push({
          service: item.description,
          isNecessary: false,
          confidence: 'MEDIUM',
          reasoning: 'Rotors can often be resurfaced instead of replaced, saving 60-70% of the cost ($60-120 vs $200-400).',
          potentialSavings: (item.line_total || 0) * 0.65,
        })
      }

      // Check general rules
      const { data: rules } = await supabase
        .from('service_necessity_rules')
        .select('*')
        .ilike('service_pattern', `%${serviceName.split(' ')[0]}%`)

      if (rules && rules.length > 0) {
        for (const rule of rules) {
          if (rule.typical_lifespan_miles && mileage < rule.typical_lifespan_miles * 0.6) {
            checks.push({
              service: item.description,
              isNecessary: false,
              confidence: 'MEDIUM',
              reasoning: rule.warning_message || 'This service may not be necessary at your current mileage.',
              potentialSavings: item.line_total || 0,
            })
            break
          }
        }
      }
    }

    return checks
  } catch (error) {
    console.error('Service necessity check error:', error)
    return []
  }
}

/**
 * Calculate total potential savings from unnecessary services
 */
export function calculatePotentialSavings(
  priceComparison: PriceComparison | null,
  serviceChecks: ServiceNecessityCheck[],
  doubleBillingCheck: { potentialSavings: number } | null,
  feeAnalysis: { estimatedOvercharge: number } | null
): {
  totalSavings: number
  breakdown: Array<{ category: string; amount: number }>
} {
  const breakdown: Array<{ category: string; amount: number }> = []
  let totalSavings = 0

  if (priceComparison && priceComparison.isOverpriced) {
    breakdown.push({
      category: 'Overpriced services',
      amount: priceComparison.potentialOvercharge,
    })
    totalSavings += priceComparison.potentialOvercharge
  }

  if (serviceChecks.length > 0) {
    const unnecessaryServiceSavings = serviceChecks.reduce(
      (sum, check) => sum + (check.isNecessary ? 0 : check.potentialSavings),
      0
    )
    if (unnecessaryServiceSavings > 0) {
      breakdown.push({
        category: 'Unnecessary services',
        amount: unnecessaryServiceSavings,
      })
      totalSavings += unnecessaryServiceSavings
    }
  }

  if (doubleBillingCheck && doubleBillingCheck.potentialSavings > 0) {
    breakdown.push({
      category: 'Double-billing',
      amount: doubleBillingCheck.potentialSavings,
    })
    totalSavings += doubleBillingCheck.potentialSavings
  }

  if (feeAnalysis && feeAnalysis.estimatedOvercharge > 0) {
    breakdown.push({
      category: 'Excessive fees',
      amount: feeAnalysis.estimatedOvercharge,
    })
    totalSavings += feeAnalysis.estimatedOvercharge
  }

  return {
    totalSavings: Math.round(totalSavings * 100) / 100,
    breakdown,
  }
}
