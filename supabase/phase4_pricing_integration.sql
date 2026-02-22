-- Migration: Phase 4 - Real Data Integrations
-- This migration adds:
-- 1. labor_rates table - BLS-derived labor rates by zip code
-- 2. parts_pricing_reference table - OEM parts pricing for markup calculations
-- 3. pricing_api_cache table - Cache for VehicleDatabases API responses
-- 4. New columns to analyses table for labor/parts analysis

-- Add new analysis columns to analyses table
ALTER TABLE public.analyses
ADD COLUMN IF NOT EXISTS labor_rate_analysis JSONB,
ADD COLUMN IF NOT EXISTS parts_markup_analysis JSONB;

-- Create labor_rates table for market labor rate data
CREATE TABLE IF NOT EXISTS public.labor_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code TEXT NOT NULL,
  region TEXT NOT NULL,                    -- 'northeast', 'southeast', 'midwest', 'southwest', 'west', 'national'
  average_mechanic_wage DECIMAL(6,2),      -- From BLS API ($/hr)
  estimated_shop_rate_min DECIMAL(6,2),    -- wage * 2.5 multiplier
  estimated_shop_rate_max DECIMAL(6,2),    -- wage * 3.5 multiplier
  data_source TEXT DEFAULT 'bls',          -- 'bls', 'manual', 'survey'
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_zip_code UNIQUE(zip_code)
);

-- Create parts_pricing_reference table for OEM parts pricing
CREATE TABLE IF NOT EXISTS public.parts_pricing_reference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_category TEXT NOT NULL,             -- 'brake_pad', 'brake_rotor', 'oil_filter', 'air_filter', 'battery', etc.
  part_name TEXT NOT NULL,                 -- 'Rear Brake Pads', 'Front Brake Rotors', etc.
  make TEXT,                               -- NULL = universal/generic part
  model TEXT,                              -- NULL = all models for this make
  year_min INTEGER,                        -- NULL = no minimum year
  year_max INTEGER,                        -- NULL = no maximum year
  oem_price_min DECIMAL(10,2) CHECK (oem_price_min >= 0),
  oem_price_max DECIMAL(10,2) CHECK (oem_price_max >= oem_price_min),
  typical_markup_percentage INTEGER,       -- e.g., 40 = 40% markup over OEM
  data_source TEXT NOT NULL,               -- 'rockauto', 'autozone', 'manual', 'napa'
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pricing_api_cache table for VehicleDatabases API caching
CREATE TABLE IF NOT EXISTS public.pricing_api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,          -- MD5 hash of (vehicle + service + zip)
  vehicle_year INTEGER,
  vehicle_make TEXT,
  vehicle_model TEXT,
  service_name TEXT,
  zip_code TEXT,
  pricing_data JSONB NOT NULL,             -- Full API response
  api_source TEXT DEFAULT 'vehicledatabases', -- 'vehicledatabases', 'repairpal', etc.
  expires_at TIMESTAMPTZ NOT NULL,         -- Typically NOW() + 30 days
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_labor_rates_zip ON public.labor_rates(zip_code);
CREATE INDEX IF NOT EXISTS idx_labor_rates_region ON public.labor_rates(region);

CREATE INDEX IF NOT EXISTS idx_parts_category ON public.parts_pricing_reference(part_category);
CREATE INDEX IF NOT EXISTS idx_parts_make_model ON public.parts_pricing_reference(make, model);
CREATE INDEX IF NOT EXISTS idx_parts_name_search ON public.parts_pricing_reference USING gin(to_tsvector('english', part_name));

CREATE INDEX IF NOT EXISTS idx_pricing_cache_key ON public.pricing_api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_pricing_cache_expires ON public.pricing_api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_pricing_cache_vehicle ON public.pricing_api_cache(vehicle_year, vehicle_make, vehicle_model);

-- Enable RLS on all new tables (read-only for authenticated users)
ALTER TABLE public.labor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_pricing_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_api_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can read (public benchmark data)
CREATE POLICY "Anyone can view labor rates" ON public.labor_rates
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view parts pricing" ON public.parts_pricing_reference
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view pricing cache" ON public.pricing_api_cache
  FOR SELECT USING (true);

-- Add comments to document the tables
COMMENT ON TABLE public.labor_rates IS 'Market labor rates by zip code derived from BLS data';
COMMENT ON TABLE public.parts_pricing_reference IS 'OEM parts pricing for markup calculations';
COMMENT ON TABLE public.pricing_api_cache IS 'Cache for external pricing API responses (30-day TTL)';

COMMENT ON COLUMN public.analyses.labor_rate_analysis IS 'JSON: { totalLaborCharged, totalLaborHours, effectiveLaborRate, marketRateMin, marketRateMax, percentageAboveMarket, isAboveMarket, confidence, zipCode }';
COMMENT ON COLUMN public.analyses.parts_markup_analysis IS 'JSON: { totalPartsCharged, estimatedOEMCost, averageMarkupPercentage, excessiveMarkupItems, totalExcessiveMarkup, confidence }';
