/**
 * Labor Rate Analyzer
 * Analyzes labor charges against market rates from BLS data
 */

import { getLaborRates } from '@/lib/api/externalApis'
import type { LineItem, LaborRateAnalysis } from '@/lib/types'

/**
 * Analyze labor rates in an auto repair estimate
 * Compares shop's labor rate to market averages from BLS data
 */
export async function analyzeLaborRates(
  lineItems: LineItem[],
  zipCode: string
): Promise<LaborRateAnalysis | null> {
  if (!zipCode || lineItems.length === 0) {
    return null
  }

  try {
    // Get market labor rates for this zip code
    const marketRatesResponse = await getLaborRates(zipCode)

    if (!marketRatesResponse.success || !marketRatesResponse.data) {
      console.log('Could not fetch labor rates for analysis')
      return null
    }

    const { shopRateMin, shopRateMax } = marketRatesResponse.data

    // Extract labor-related line items
    const laborItems = identifyLaborLineItems(lineItems)

    if (laborItems.length === 0) {
      // No identifiable labor charges
      return null
    }

    // Calculate total labor charged and hours
    let totalLaborCharged = 0
    let totalLaborHours = 0

    for (const item of laborItems) {
      const lineTotal = item.line_total || 0
      totalLaborCharged += lineTotal

      // Try to extract hours from description or quantity
      const hours = extractLaborHours(item)
      if (hours > 0) {
        totalLaborHours += hours
      }
    }

    // Calculate effective labor rate
    let effectiveLaborRate = 0
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'

    if (totalLaborHours > 0) {
      effectiveLaborRate = Math.round(totalLaborCharged / totalLaborHours)
      confidence = 'HIGH'
    } else {
      // Estimate labor rate using industry average hours for common services
      const estimatedHours = estimateLaborHours(laborItems)
      if (estimatedHours > 0) {
        effectiveLaborRate = Math.round(totalLaborCharged / estimatedHours)
        totalLaborHours = estimatedHours
        confidence = 'LOW'
      } else {
        // Cannot determine labor rate
        return null
      }
    }

    // Calculate percentage above market
    const marketAverage = (shopRateMin + shopRateMax) / 2
    const percentageAboveMarket = Math.round(
      ((effectiveLaborRate - marketAverage) / marketAverage) * 100
    )

    const isAboveMarket = effectiveLaborRate > shopRateMax

    return {
      totalLaborCharged,
      totalLaborHours,
      effectiveLaborRate,
      marketRateMin: shopRateMin,
      marketRateMax: shopRateMax,
      percentageAboveMarket,
      isAboveMarket,
      confidence,
      zipCode,
    }
  } catch (error) {
    console.error('Labor rate analysis error:', error)
    return null
  }
}

/**
 * Identify labor-related line items from the estimate
 */
function identifyLaborLineItems(lineItems: LineItem[]): LineItem[] {
  const laborKeywords = [
    'labor',
    'labour',
    'service',
    'install',
    'installation',
    'repair',
    'replace',
    'replacement',
    'diagnostic',
    'diagnosis',
    'technician',
    'mechanic',
    'work',
    'hrs',
    'hours',
    'hour',
  ]

  const excludeKeywords = [
    'parts',
    'part',
    'oil',
    'filter',
    'fluid',
    'brake pad',
    'rotor',
    'battery',
    'tire',
    'belt',
    'hose',
  ]

  return lineItems.filter((item) => {
    const desc = item.description.toLowerCase()

    // Exclude if it's clearly a parts line item
    if (excludeKeywords.some((keyword) => desc.includes(keyword))) {
      // Unless it explicitly mentions labor alongside parts
      if (!laborKeywords.some((keyword) => desc.includes(keyword))) {
        return false
      }
    }

    // Include if it contains labor keywords
    return laborKeywords.some((keyword) => desc.includes(keyword))
  })
}

/**
 * Extract labor hours from line item description or quantity
 */
function extractLaborHours(item: LineItem): number {
  // Check quantity field first (often represents hours)
  if (item.quantity && item.quantity > 0 && item.quantity < 100) {
    // Verify this looks like hours (not quantity of parts)
    const desc = item.description.toLowerCase()
    if (
      desc.includes('labor') ||
      desc.includes('hrs') ||
      desc.includes('hours') ||
      desc.includes('hour')
    ) {
      return item.quantity
    }
  }

  // Try to extract hours from description
  const desc = item.description
  const patterns = [
    /(\d+\.?\d*)\s*hrs?/i,
    /(\d+\.?\d*)\s*hours?/i,
    /labor\s*[:-]\s*(\d+\.?\d*)/i,
  ]

  for (const pattern of patterns) {
    const match = desc.match(pattern)
    if (match && match[1]) {
      const hours = parseFloat(match[1])
      if (hours > 0 && hours < 100) {
        return hours
      }
    }
  }

  return 0
}

/**
 * Estimate labor hours based on common service types when not explicitly stated
 */
function estimateLaborHours(laborItems: LineItem[]): number {
  const serviceHourEstimates: Record<string, number> = {
    'oil change': 0.5,
    'brake pad': 1.5,
    'brake rotor': 2.0,
    'tire rotation': 0.5,
    'wheel alignment': 1.0,
    'battery replacement': 0.5,
    'alternator': 2.5,
    'starter': 2.0,
    'transmission': 8.0,
    'engine diagnostic': 1.0,
    'ac recharge': 1.0,
    'spark plug': 2.0,
    'timing belt': 6.0,
    'water pump': 4.0,
    'radiator': 4.0,
    'suspension': 3.0,
    'strut': 3.5,
    'shock': 2.5,
  }

  let estimatedHours = 0

  for (const item of laborItems) {
    const desc = item.description.toLowerCase()

    // Try to match known service types
    for (const [service, hours] of Object.entries(serviceHourEstimates)) {
      if (desc.includes(service)) {
        estimatedHours += hours
        break // Don't double-count
      }
    }
  }

  // If we couldn't estimate specific services, use a conservative default
  if (estimatedHours === 0 && laborItems.length > 0) {
    // Assume 1.5 hours per labor line item as fallback
    estimatedHours = laborItems.length * 1.5
  }

  return estimatedHours
}
