import { findSimilarServices, AutoRepairPricing, PricingQueryOptions } from './auto-repair-db'
import { LineItem } from '@/lib/types'

export interface PriceMatch {
  lineItem: LineItem
  matchedService: AutoRepairPricing | null
  confidence: number // 0-100
  fairPriceMin: number | null
  fairPriceMax: number | null
  isOverpriced: boolean
  overchargeAmount: number
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  // Create matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j] + 1       // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score (0-100) between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 100

  const maxLength = Math.max(s1.length, s2.length)
  if (maxLength === 0) return 100

  const distance = levenshteinDistance(s1, s2)
  const similarity = ((maxLength - distance) / maxLength) * 100

  return Math.max(0, Math.min(100, similarity))
}

/**
 * Extract key terms from description for better matching
 */
function extractKeyTerms(description: string): string[] {
  const cleaned = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Common auto repair terms to prioritize
  const keyTerms = [
    'brake', 'pad', 'rotor', 'caliper',
    'oil', 'filter', 'change', 'synthetic', 'conventional',
    'tire', 'rotation', 'alignment', 'balance',
    'battery', 'replace', 'test',
    'alternator', 'starter',
    'transmission', 'flush', 'fluid',
    'spark', 'plug',
    'belt', 'timing',
    'suspension', 'strut', 'shock',
    'exhaust', 'muffler', 'catalytic',
    'ac', 'air', 'conditioning', 'recharge',
    'water', 'pump',
    'radiator', 'coolant',
    'fuel', 'pump', 'injector',
    'diagnostic', 'labor', 'parts',
  ]

  const words = cleaned.split(' ')
  const found = words.filter(word => keyTerms.includes(word))

  return found.length > 0 ? found : words
}

/**
 * Match a line item to a service in the pricing database
 */
export async function matchLineItemToService(
  lineItem: LineItem,
  options: PricingQueryOptions = {}
): Promise<PriceMatch> {
  const description = lineItem.description || ''

  // If no description or price, return no match
  if (!description || !lineItem.line_total) {
    return {
      lineItem,
      matchedService: null,
      confidence: 0,
      fairPriceMin: null,
      fairPriceMax: null,
      isOverpriced: false,
      overchargeAmount: 0,
    }
  }

  // Try to find similar services
  const similarServices = await findSimilarServices(description, options)

  if (similarServices.length === 0) {
    return {
      lineItem,
      matchedService: null,
      confidence: 0,
      fairPriceMin: null,
      fairPriceMax: null,
      isOverpriced: false,
      overchargeAmount: 0,
    }
  }

  // Calculate similarity scores for each match
  const matches = similarServices.map(service => {
    const similarity = calculateSimilarity(description, service.service_label)
    const keyTermSimilarity = calculateSimilarity(
      extractKeyTerms(description).join(' '),
      extractKeyTerms(service.service_label).join(' ')
    )

    // Weighted score: 60% string similarity, 40% key term similarity
    const score = (similarity * 0.6) + (keyTermSimilarity * 0.4)

    return {
      service,
      score,
    }
  })

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score)

  const bestMatch = matches[0]

  // Only consider it a match if score is above threshold (50%)
  if (bestMatch.score < 50) {
    return {
      lineItem,
      matchedService: null,
      confidence: Math.round(bestMatch.score),
      fairPriceMin: null,
      fairPriceMax: null,
      isOverpriced: false,
      overchargeAmount: 0,
    }
  }

  const matchedService = bestMatch.service
  const lineItemPrice = lineItem.line_total
  const isOverpriced = lineItemPrice > matchedService.fair_price_max
  const overchargeAmount = isOverpriced
    ? Math.max(0, lineItemPrice - matchedService.fair_price_max)
    : 0

  return {
    lineItem,
    matchedService,
    confidence: Math.round(bestMatch.score),
    fairPriceMin: matchedService.fair_price_min,
    fairPriceMax: matchedService.fair_price_max,
    isOverpriced,
    overchargeAmount,
  }
}

/**
 * Match all line items in an estimate to services
 */
export async function matchAllLineItems(
  lineItems: LineItem[],
  options: PricingQueryOptions = {}
): Promise<PriceMatch[]> {
  const matches = await Promise.all(
    lineItems.map(item => matchLineItemToService(item, options))
  )

  return matches
}

/**
 * Calculate total overcharge across all matched items
 */
export function calculateTotalOvercharge(matches: PriceMatch[]): number {
  return matches.reduce((total, match) => {
    return total + match.overchargeAmount
  }, 0)
}

/**
 * Get summary statistics from price matches
 */
export function getPriceMatchSummary(matches: PriceMatch[]): {
  totalMatches: number
  averageConfidence: number
  overchargedItems: number
  totalOvercharge: number
  matchRate: number
} {
  const totalItems = matches.length
  const matchedItems = matches.filter(m => m.matchedService !== null)
  const overchargedItems = matches.filter(m => m.isOverpriced)

  const averageConfidence = matchedItems.length > 0
    ? matchedItems.reduce((sum, m) => sum + m.confidence, 0) / matchedItems.length
    : 0

  return {
    totalMatches: matchedItems.length,
    averageConfidence: Math.round(averageConfidence),
    overchargedItems: overchargedItems.length,
    totalOvercharge: calculateTotalOvercharge(matches),
    matchRate: totalItems > 0 ? (matchedItems.length / totalItems) * 100 : 0,
  }
}
