/**
 * External API Integrations
 * - VehicleDatabases.com for verified market pricing (Phase 4)
 * - BLS API for labor rate data (Phase 4)
 * - RepairPal for verified market pricing (legacy placeholder)
 * - Google Places for shop reputation verification
 */

import { createClient } from '@/lib/supabase/server'
import type { VehicleInfo, VehicleDatabasesPricingResponse, BLSLaborRateResponse } from '@/lib/types'
import crypto from 'crypto'

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

/**
 * Phase 4: VehicleDatabases.com API Integration
 * Fetch real market pricing for auto repair services
 */
export async function getVehicleDatabasesPricing(
  vehicleInfo: VehicleInfo,
  serviceName: string,
  zipCode?: string
): Promise<VehicleDatabasesPricingResponse> {
  const apiKey = process.env.VEHICLE_DATABASES_API_KEY
  const apiUrl = process.env.VEHICLE_DATABASES_API_URL

  if (!apiKey || !apiUrl) {
    console.log('VehicleDatabases API not configured, skipping external pricing check')
    return { success: false, error: 'API not configured' }
  }

  // Validate vehicle info
  if (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model) {
    return { success: false, error: 'Incomplete vehicle information' }
  }

  try {
    // Check cache first (30-day TTL)
    const cacheKey = crypto
      .createHash('md5')
      .update(`${vehicleInfo.year}-${vehicleInfo.make}-${vehicleInfo.model}-${serviceName}-${zipCode || 'national'}`)
      .digest('hex')

    const supabase = await createClient()
    const { data: cached } = await supabase
      .from('pricing_api_cache')
      .select('pricing_data, expires_at')
      .eq('cache_key', cacheKey)
      .single()

    if (cached && new Date(cached.expires_at) > new Date()) {
      console.log('Using cached VehicleDatabases pricing')
      return cached.pricing_data as VehicleDatabasesPricingResponse
    }

    // Make API call
    const response = await fetch(`${apiUrl}/estimates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year: vehicleInfo.year,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        service: serviceName,
        zip_code: zipCode,
      }),
    })

    if (!response.ok) {
      console.error('VehicleDatabases API error:', response.statusText)
      return { success: false, error: `API error: ${response.statusText}` }
    }

    const apiData = await response.json()

    // Transform to our format
    const result: VehicleDatabasesPricingResponse = {
      success: true,
      data: {
        vehicle: {
          year: vehicleInfo.year,
          make: vehicleInfo.make,
          model: vehicleInfo.model,
        },
        service: serviceName,
        pricing: {
          parts: {
            min: apiData.parts_min || 0,
            max: apiData.parts_max || 0,
          },
          labor: {
            hours_min: apiData.labor_hours_min || 0,
            hours_max: apiData.labor_hours_max || 0,
            rate_min: apiData.labor_rate_min || 0,
            rate_max: apiData.labor_rate_max || 0,
          },
          total: {
            min: apiData.total_min || 0,
            max: apiData.total_max || 0,
          },
        },
        confidence: apiData.confidence || 'MEDIUM',
        location: zipCode,
      },
    }

    // Cache the result (30-day expiration)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await supabase.from('pricing_api_cache').upsert({
      cache_key: cacheKey,
      vehicle_year: vehicleInfo.year,
      vehicle_make: vehicleInfo.make,
      vehicle_model: vehicleInfo.model,
      service_name: serviceName,
      zip_code: zipCode || null,
      pricing_data: result,
      api_source: 'vehicledatabases',
      expires_at: expiresAt.toISOString(),
    })

    return result
  } catch (error) {
    console.error('VehicleDatabases API error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Phase 4: BLS API Integration
 * Fetch labor rates by zip code from Bureau of Labor Statistics
 */
export async function getLaborRates(zipCode: string): Promise<BLSLaborRateResponse> {
  const apiUrl = process.env.BLS_API_URL || 'https://api.bls.gov/publicAPI/v2'

  if (!zipCode) {
    return { success: false, error: 'Zip code required' }
  }

  try {
    // Check database cache first
    const supabase = await createClient()
    const { data: cached } = await supabase
      .from('labor_rates')
      .select('*')
      .eq('zip_code', zipCode)
      .single()

    if (cached) {
      // Use cached data if less than 90 days old
      const lastUpdated = new Date(cached.last_updated)
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      if (lastUpdated > ninetyDaysAgo) {
        console.log('Using cached BLS labor rates')
        return {
          success: true,
          data: {
            zipCode: cached.zip_code,
            region: cached.region,
            averageWage: parseFloat(cached.average_mechanic_wage),
            shopRateMin: parseFloat(cached.estimated_shop_rate_min),
            shopRateMax: parseFloat(cached.estimated_shop_rate_max),
            dataSource: cached.data_source,
            lastUpdated: cached.last_updated,
          },
        }
      }
    }

    // Map zip code to region (simplified - in production, use a zip code database)
    const region = getRegionFromZipCode(zipCode)

    // BLS API call for automotive service technicians wage data
    // Series ID: OEUM493023000000003 (Mean hourly wage for Automotive Service Technicians and Mechanics)
    const seriesId = 'OEUM493023000000003'

    const response = await fetch(`${apiUrl}/timeseries/data/${seriesId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Fallback to national average if API fails
      return getFallbackLaborRate(zipCode, region)
    }

    const apiData = await response.json()

    if (apiData.status !== 'REQUEST_SUCCEEDED' || !apiData.Results?.series?.[0]?.data?.[0]) {
      return getFallbackLaborRate(zipCode, region)
    }

    // Get most recent wage data
    const latestData = apiData.Results.series[0].data[0]
    const averageWage = parseFloat(latestData.value)

    // Apply multipliers to get shop rates (2.5x to 3.5x mechanic wage)
    const shopRateMin = Math.round(averageWage * 2.5)
    const shopRateMax = Math.round(averageWage * 3.5)

    // Store in database
    await supabase.from('labor_rates').upsert({
      zip_code: zipCode,
      region,
      average_mechanic_wage: averageWage,
      estimated_shop_rate_min: shopRateMin,
      estimated_shop_rate_max: shopRateMax,
      data_source: 'bls',
      last_updated: new Date().toISOString(),
    })

    return {
      success: true,
      data: {
        zipCode,
        region,
        averageWage,
        shopRateMin,
        shopRateMax,
        dataSource: 'bls',
        lastUpdated: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('BLS API error:', error)
    const region = getRegionFromZipCode(zipCode)
    return getFallbackLaborRate(zipCode, region)
  }
}

/**
 * Helper: Get region from zip code (simplified mapping)
 */
function getRegionFromZipCode(zipCode: string): string {
  const zip = parseInt(zipCode.substring(0, 3))

  if (zip >= 0 && zip <= 99) return 'northeast'       // CT, MA, ME, NH, NJ, RI, VT
  if (zip >= 100 && zip <= 199) return 'northeast'    // NY
  if (zip >= 200 && zip <= 299) return 'northeast'    // DC, MD, NC, SC, VA, WV
  if (zip >= 300 && zip <= 399) return 'southeast'    // AL, FL, GA, MS, TN
  if (zip >= 400 && zip <= 499) return 'midwest'      // IN, KY, MI, OH
  if (zip >= 500 && zip <= 599) return 'midwest'      // IA, MN, MT, ND, SD, WI
  if (zip >= 600 && zip <= 699) return 'midwest'      // IL, KS, MO, NE
  if (zip >= 700 && zip <= 799) return 'southwest'    // AR, LA, OK, TX
  if (zip >= 800 && zip <= 899) return 'west'         // AZ, CO, ID, NM, NV, UT, WY
  if (zip >= 900 && zip <= 999) return 'west'         // AK, CA, HI, OR, WA

  return 'national'
}

/**
 * Helper: Fallback labor rates when BLS API is unavailable
 */
function getFallbackLaborRate(zipCode: string, region: string): BLSLaborRateResponse {
  // National averages as fallback (2026 estimates)
  const regionalMultipliers: Record<string, number> = {
    northeast: 1.15,
    southeast: 0.90,
    midwest: 0.95,
    southwest: 0.95,
    west: 1.20,
    national: 1.00,
  }

  const nationalAvgWage = 24.50 // National average mechanic wage ($/hr estimate)
  const multiplier = regionalMultipliers[region] || 1.0
  const averageWage = nationalAvgWage * multiplier

  const shopRateMin = Math.round(averageWage * 2.5)
  const shopRateMax = Math.round(averageWage * 3.5)

  return {
    success: true,
    data: {
      zipCode,
      region,
      averageWage,
      shopRateMin,
      shopRateMax,
      dataSource: 'fallback_estimate',
      lastUpdated: new Date().toISOString(),
    },
  }
}
