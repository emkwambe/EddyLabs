-- Migration: Add auto repair pricing features
-- This migration:
-- 1. Adds new JSONB columns to analyses table for advanced analysis results
-- 2. Creates auto_repair_pricing table for benchmark pricing data

-- Add new columns to analyses table for storing additional analysis results
ALTER TABLE public.analyses
ADD COLUMN IF NOT EXISTS fee_analysis JSONB,
ADD COLUMN IF NOT EXISTS double_billing_check JSONB,
ADD COLUMN IF NOT EXISTS price_comparison JSONB,
ADD COLUMN IF NOT EXISTS shop_reputation JSONB;

-- Create auto_repair_pricing table for benchmark pricing data
CREATE TABLE IF NOT EXISTS public.auto_repair_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category TEXT NOT NULL,    -- 'brakes', 'engine', 'transmission', 'electrical', 'suspension', etc.
  service_type TEXT NOT NULL,        -- 'brake_pad_replacement_front', 'oil_change_synthetic', etc.
  service_label TEXT NOT NULL,       -- 'Brake Pad Replacement (Front)', 'Synthetic Oil Change', etc.
  make TEXT,                         -- NULL = applies to all makes
  model TEXT,                        -- NULL = applies to all models
  year_min INTEGER,                  -- NULL = no minimum year
  year_max INTEGER,                  -- NULL = no maximum year
  region TEXT DEFAULT 'national',    -- 'national', 'northeast', 'southeast', 'midwest', 'southwest', 'west'
  fair_price_min DECIMAL(10,2) NOT NULL CHECK (fair_price_min >= 0),
  fair_price_max DECIMAL(10,2) NOT NULL CHECK (fair_price_max >= fair_price_min),
  labor_hours_min DECIMAL(4,2) CHECK (labor_hours_min >= 0),
  labor_hours_max DECIMAL(4,2) CHECK (labor_hours_max >= labor_hours_min),
  labor_rate_min DECIMAL(6,2) CHECK (labor_rate_min >= 0),  -- $/hr shop labor rate
  labor_rate_max DECIMAL(6,2) CHECK (labor_rate_max >= labor_rate_min),
  parts_cost_min DECIMAL(10,2) CHECK (parts_cost_min >= 0),
  parts_cost_max DECIMAL(10,2) CHECK (parts_cost_max >= parts_cost_min),
  data_source TEXT NOT NULL,         -- 'aaa', 'kbb', 'carmd', 'repairpal', 'manual', etc.
  confidence INTEGER DEFAULT 70 CHECK (confidence >= 0 AND confidence <= 100),  -- Data quality score
  notes TEXT,                        -- Additional context or notes
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_auto_pricing_service_type ON public.auto_repair_pricing(service_type);
CREATE INDEX IF NOT EXISTS idx_auto_pricing_category ON public.auto_repair_pricing(service_category);
CREATE INDEX IF NOT EXISTS idx_auto_pricing_make_model ON public.auto_repair_pricing(make, model);
CREATE INDEX IF NOT EXISTS idx_auto_pricing_region ON public.auto_repair_pricing(region);
CREATE INDEX IF NOT EXISTS idx_auto_pricing_service_label ON public.auto_repair_pricing USING gin(to_tsvector('english', service_label));

-- Enable RLS on auto_repair_pricing (read-only for all authenticated users)
ALTER TABLE public.auto_repair_pricing ENABLE ROW LEVEL SECURITY;

-- Anyone can read pricing data (it's public benchmark data)
CREATE POLICY "Anyone can view pricing data" ON public.auto_repair_pricing
  FOR SELECT USING (true);

-- Only admins can modify pricing data (implement admin role check if needed)
-- For now, we'll control writes via server-side code only

-- Add comments to document the tables
COMMENT ON TABLE public.auto_repair_pricing IS 'Benchmark pricing data for auto repair services';
COMMENT ON COLUMN public.auto_repair_pricing.service_category IS 'High-level category: brakes, engine, transmission, etc.';
COMMENT ON COLUMN public.auto_repair_pricing.service_type IS 'Specific service identifier for programmatic matching';
COMMENT ON COLUMN public.auto_repair_pricing.service_label IS 'Human-readable service name';
COMMENT ON COLUMN public.auto_repair_pricing.confidence IS 'Data quality/confidence score (0-100)';
COMMENT ON COLUMN public.analyses.fee_analysis IS 'JSON: { totalFees, feePercentage, isSuspicious, estimatedOvercharge, reasoning }';
COMMENT ON COLUMN public.analyses.double_billing_check IS 'JSON: { hasDoubleBilling, diagnosticFee, laborHours, explanation, potentialSavings }';
COMMENT ON COLUMN public.analyses.price_comparison IS 'JSON: { estimateTotal, fairPriceMin, fairPriceMax, isOverpriced, potentialOvercharge, confidence }';
COMMENT ON COLUMN public.analyses.shop_reputation IS 'JSON: { shopName, rating, totalReviews, verifiedBusiness, warnings, trustScore, recentReviews }';
