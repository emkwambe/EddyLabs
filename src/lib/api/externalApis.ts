/**
 * External API Integrations
 * - RepairPal for verified market pricing
 * - Google Places for shop reputation verification
 */

export interface RepairPalPricing {
  serviceName: string
  nationalAverage: {
    min: number
    max: number
  }
  localAverage?: {
    min: number
    max: number
    zipCode: string
  }
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  source: string
}

export interface ShopReputation {
  shopName: string
  placeId: string | null
  rating: number | null
  totalReviews: number
  recentReviews: Array<{
    rating: number
    text: string
    time: string
  }>
  verifiedBusiness: boolean
  warnings: string[]
  trustScore: number // 0-100
}

/**
 * Fetch pricing data from RepairPal API
 * Note: RepairPal doesn't have a public API. This is a placeholder for the integration.
 * In production, you would need to:
 * 1. Sign up for RepairPal API access (if available)
 * 2. Or use web scraping with proper rate limiting
 * 3. Or partner with RepairPal for data access
 */
export async function getRepairPalPricing(
  serviceName: string,
  zipCode?: string
): Promise<RepairPalPricing | null> {
  // Check if API key is configured
  const apiKey = process.env.REPAIRPAL_API_KEY

  if (!apiKey) {
    console.log('RepairPal API key not configured, skipping external pricing check')
    return null
  }

  try {
    // TODO: Implement actual RepairPal API call when available
    // For now, return null to use our internal benchmarks
    console.log(`Would fetch RepairPal pricing for: ${serviceName} in ${zipCode || 'national'}`)

    // Example of what the API call would look like:
    // const response = await fetch(`https://api.repairpal.com/v1/estimates`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     service: serviceName,
    //     zip_code: zipCode,
    //   }),
    // })
    // const data = await response.json()
    // return {
    //   serviceName,
    //   nationalAverage: {
    //     min: data.national_min,
    //     max: data.national_max,
    //   },
    //   localAverage: zipCode ? {
    //     min: data.local_min,
    //     max: data.local_max,
    //     zipCode,
    //   } : undefined,
    //   confidence: 'HIGH',
    //   source: 'RepairPal',
    // }

    return null
  } catch (error) {
    console.error('RepairPal API error:', error)
    return null
  }
}

/**
 * Fetch shop reputation from Google Places API
 */
export async function getShopReputation(
  shopName: string,
  address?: string
): Promise<ShopReputation | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    console.log('Google Places API key not configured, skipping reputation check')
    return null
  }

  try {
    // Step 1: Find the place using Places API Text Search
    const searchQuery = address ? `${shopName} ${address}` : shopName
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name&key=${apiKey}`

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchData.candidates || searchData.candidates.length === 0) {
      return {
        shopName,
        placeId: null,
        rating: null,
        totalReviews: 0,
        recentReviews: [],
        verifiedBusiness: false,
        warnings: ['Business not found on Google Places'],
        trustScore: 30, // Low trust if not found
      }
    }

    const placeId = searchData.candidates[0].place_id

    // Step 2: Get detailed place information
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,business_status&key=${apiKey}`

    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()

    if (!detailsData.result) {
      return null
    }

    const result = detailsData.result
    const rating = result.rating || 0
    const totalReviews = result.user_ratings_total || 0
    const reviews = result.reviews || []

    // Calculate trust score (0-100)
    let trustScore = 50 // Base score

    // Rating contribution (0-40 points)
    if (rating >= 4.5) trustScore += 40
    else if (rating >= 4.0) trustScore += 30
    else if (rating >= 3.5) trustScore += 20
    else if (rating >= 3.0) trustScore += 10
    else trustScore -= 10

    // Review count contribution (0-30 points)
    if (totalReviews >= 100) trustScore += 30
    else if (totalReviews >= 50) trustScore += 20
    else if (totalReviews >= 20) trustScore += 10
    else if (totalReviews >= 5) trustScore += 5
    else trustScore -= 10

    // Business status contribution (0-20 points)
    const verifiedBusiness = result.business_status === 'OPERATIONAL'
    if (verifiedBusiness) trustScore += 20

    // Identify warnings from recent reviews
    const warnings: string[] = []
    const recentReviews = reviews.slice(0, 5).map((review: any) => ({
      rating: review.rating,
      text: review.text,
      time: review.relative_time_description,
    }))

    // Check for negative patterns in recent reviews
    const lowRatingReviews = recentReviews.filter((r: { rating: number; text: string; time: string }) => r.rating <= 2)
    if (lowRatingReviews.length >= 2) {
      warnings.push('Multiple recent negative reviews')
      trustScore -= 10
    }

    // Check for scam/fraud keywords
    const scamKeywords = ['scam', 'fraud', 'rip off', 'ripoff', 'overcharged', 'unnecessary work']
    const hasScamWarnings = recentReviews.some((r: { rating: number; text: string; time: string }) =>
      scamKeywords.some((keyword) => r.text.toLowerCase().includes(keyword))
    )
    if (hasScamWarnings) {
      warnings.push('Recent reviews mention overcharging or unnecessary work')
      trustScore -= 15
    }

    // Ensure trust score is between 0-100
    trustScore = Math.max(0, Math.min(100, trustScore))

    return {
      shopName: result.name,
      placeId,
      rating,
      totalReviews,
      recentReviews,
      verifiedBusiness,
      warnings,
      trustScore,
    }
  } catch (error) {
    console.error('Google Places API error:', error)
    return null
  }
}

/**
 * Get comprehensive pricing data combining internal benchmarks and external APIs
 */
export async function getComprehensivePricing(
  serviceName: string,
  zipCode?: string
): Promise<{
  hasPricing: boolean
  sources: string[]
  nationalMin: number
  nationalMax: number
  localMin?: number
  localMax?: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}> {
  const sources: string[] = []
  let nationalMin = 0
  let nationalMax = 0
  let localMin: number | undefined
  let localMax: number | undefined
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'

  // Try to get RepairPal pricing
  const repairPalData = await getRepairPalPricing(serviceName, zipCode)
  if (repairPalData) {
    sources.push('RepairPal')
    nationalMin = repairPalData.nationalAverage.min
    nationalMax = repairPalData.nationalAverage.max
    if (repairPalData.localAverage) {
      localMin = repairPalData.localAverage.min
      localMax = repairPalData.localAverage.max
    }
    confidence = 'HIGH'
  }

  // If no external data, we'll fall back to internal benchmarks (handled in priceComparison.ts)

  return {
    hasPricing: sources.length > 0,
    sources,
    nationalMin,
    nationalMax,
    localMin,
    localMax,
    confidence,
  }
}
