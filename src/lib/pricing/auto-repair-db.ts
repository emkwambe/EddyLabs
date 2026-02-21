import { createClient } from '@/lib/supabase/server'

export interface AutoRepairPricing {
  id: string
  service_category: string
  service_type: string
  service_label: string
  make: string | null
  model: string | null
  year_min: number | null
  year_max: number | null
  region: string
  fair_price_min: number
  fair_price_max: number
  labor_hours_min: number | null
  labor_hours_max: number | null
  labor_rate_min: number | null
  labor_rate_max: number | null
  parts_cost_min: number | null
  parts_cost_max: number | null
  data_source: string
  confidence: number
  notes: string | null
  last_updated: string
  created_at: string
}

export interface PricingQueryOptions {
  make?: string
  model?: string
  year?: number
  region?: string
}

/**
 * Query pricing by exact service type
 */
export async function queryPricingByService(
  serviceType: string,
  options: PricingQueryOptions = {}
): Promise<AutoRepairPricing | null> {
  const supabase = await createClient()

  let query = supabase
    .from('auto_repair_pricing')
    .select('*')
    .eq('service_type', serviceType)

  // Filter by region if provided, fallback to national
  if (options.region) {
    query = query.or(`region.eq.${options.region},region.eq.national`)
  } else {
    query = query.eq('region', 'national')
  }

  // Filter by make/model if provided
  if (options.make) {
    query = query.or(`make.eq.${options.make},make.is.null`)
  } else {
    query = query.is('make', null)
  }

  if (options.model && options.make) {
    query = query.or(`model.eq.${options.model},model.is.null`)
  } else {
    query = query.is('model', null)
  }

  // Filter by year if provided
  if (options.year) {
    query = query.or(`year_min.lte.${options.year},year_min.is.null`)
    query = query.or(`year_max.gte.${options.year},year_max.is.null`)
  }

  // Order by specificity (more specific matches first) and confidence
  query = query.order('make', { ascending: false, nullsFirst: false })
  query = query.order('model', { ascending: false, nullsFirst: false })
  query = query.order('confidence', { ascending: false })
  query = query.limit(1)

  const { data, error } = await query

  if (error) {
    console.error('Error querying pricing:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * Find similar services by fuzzy search on service label
 */
export async function findSimilarServices(
  description: string,
  options: PricingQueryOptions = {}
): Promise<AutoRepairPricing[]> {
  const supabase = await createClient()

  // Clean and prepare search term
  const searchTerm = description.toLowerCase().trim()

  let query = supabase
    .from('auto_repair_pricing')
    .select('*')
    .textSearch('service_label', searchTerm, {
      type: 'websearch',
      config: 'english',
    })

  // Apply filters
  if (options.region) {
    query = query.or(`region.eq.${options.region},region.eq.national`)
  }

  if (options.make) {
    query = query.or(`make.eq.${options.make},make.is.null`)
  }

  if (options.model && options.make) {
    query = query.or(`model.eq.${options.model},model.is.null`)
  }

  if (options.year) {
    query = query.or(`year_min.lte.${options.year},year_min.is.null`)
    query = query.or(`year_max.gte.${options.year},year_max.is.null`)
  }

  query = query.order('confidence', { ascending: false })
  query = query.limit(10)

  const { data, error } = await query

  if (error) {
    console.error('Error finding similar services:', error)
    return []
  }

  return data || []
}

/**
 * Get pricing range for a service type
 */
export async function getPricingRange(
  serviceType: string,
  options: PricingQueryOptions = {}
): Promise<{ min: number; max: number; confidence: number } | null> {
  const pricing = await queryPricingByService(serviceType, options)

  if (!pricing) {
    return null
  }

  return {
    min: pricing.fair_price_min,
    max: pricing.fair_price_max,
    confidence: pricing.confidence,
  }
}

/**
 * Get all pricing for a service category
 */
export async function getPricingByCategory(
  category: string,
  options: PricingQueryOptions = {}
): Promise<AutoRepairPricing[]> {
  const supabase = await createClient()

  let query = supabase
    .from('auto_repair_pricing')
    .select('*')
    .eq('service_category', category)

  if (options.region) {
    query = query.or(`region.eq.${options.region},region.eq.national`)
  }

  if (options.make) {
    query = query.or(`make.eq.${options.make},make.is.null`)
  }

  if (options.model && options.make) {
    query = query.or(`model.eq.${options.model},model.is.null`)
  }

  if (options.year) {
    query = query.or(`year_min.lte.${options.year},year_min.is.null`)
    query = query.or(`year_max.gte.${options.year},year_max.is.null`)
  }

  query = query.order('confidence', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error getting category pricing:', error)
    return []
  }

  return data || []
}

/**
 * Get all service categories
 */
export async function getServiceCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('auto_repair_pricing')
    .select('service_category')
    .order('service_category')

  if (error) {
    console.error('Error getting categories:', error)
    return []
  }

  // Get unique categories
  const categories = Array.from(
    new Set(data?.map((row) => row.service_category) || [])
  )

  return categories
}
