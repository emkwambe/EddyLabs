-- Price Benchmark Database Tables
-- Add this to your Supabase SQL Editor

-- Auto repair price benchmarks
CREATE TABLE IF NOT EXISTS public.auto_repair_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  service_category TEXT, -- brake, oil_change, transmission, etc.
  price_min DECIMAL(10,2) NOT NULL,
  price_max DECIMAL(10,2) NOT NULL,
  labor_hours_min DECIMAL(4,2),
  labor_hours_max DECIMAL(4,2),
  parts_cost_min DECIMAL(10,2),
  parts_cost_max DECIMAL(10,2),
  vehicle_type TEXT, -- sedan, suv, truck, luxury
  region TEXT DEFAULT 'US_NATIONAL',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle maintenance schedules
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make TEXT NOT NULL,
  model TEXT,
  year_min INT,
  year_max INT,
  service_name TEXT NOT NULL,
  typical_mileage INT NOT NULL, -- when this service is typically needed
  interval_miles INT, -- how often to repeat
  is_critical BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service necessity rules (generic rules that apply across vehicles)
CREATE TABLE IF NOT EXISTS public.service_necessity_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_pattern TEXT NOT NULL, -- regex or keywords to match service
  typical_lifespan_miles INT, -- how long this component typically lasts
  confidence_threshold DECIMAL(3,2), -- 0-1 score for when to flag as unnecessary
  warning_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auto_repair_prices_service ON public.auto_repair_prices(service_name, vehicle_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_make_model ON public.maintenance_schedules(make, model);
CREATE INDEX IF NOT EXISTS idx_service_necessity_pattern ON public.service_necessity_rules(service_pattern);

-- Insert some baseline auto repair price data (US national averages)
INSERT INTO public.auto_repair_prices (service_name, service_category, price_min, price_max, labor_hours_min, labor_hours_max, parts_cost_min, parts_cost_max, vehicle_type) VALUES
-- Brakes
('Front Brake Pads Replacement', 'brake', 115, 300, 0.5, 1.5, 35, 100, 'sedan'),
('Rear Brake Pads Replacement', 'brake', 115, 300, 0.5, 1.5, 35, 100, 'sedan'),
('Front Brake Rotors Replacement', 'brake', 200, 400, 1.0, 2.0, 50, 150, 'sedan'),
('Brake Rotors Resurface', 'brake', 60, 120, 0.5, 1.0, 10, 30, 'sedan'),
('Complete Front Brake Job', 'brake', 280, 450, 1.5, 2.5, 100, 200, 'sedan'),
('Complete Rear Brake Job', 'brake', 250, 400, 1.5, 2.5, 80, 180, 'sedan'),

-- Oil & Fluids
('Oil Change (Conventional)', 'oil_change', 35, 75, 0.25, 0.5, 20, 40, 'sedan'),
('Oil Change (Synthetic)', 'oil_change', 65, 125, 0.25, 0.5, 45, 85, 'sedan'),

-- Diagnostic
('Diagnostic Fee', 'diagnostic', 0, 50, 0.5, 1.5, 0, 0, 'sedan'),

-- Fees
('Shop Supplies Fee', 'fee', 0, 25, 0, 0, 0, 25, 'sedan'),
('Environmental Fee', 'fee', 0, 15, 0, 0, 0, 15, 'sedan'),
('Disposal Fee', 'fee', 0, 10, 0, 0, 0, 10, 'sedan')
ON CONFLICT DO NOTHING;

-- Insert Honda Accord maintenance schedule (example)
INSERT INTO public.maintenance_schedules (make, model, year_min, year_max, service_name, typical_mileage, interval_miles, is_critical) VALUES
('Honda', 'Accord', 2015, 2025, 'Oil Change', 5000, 5000, true),
('Honda', 'Accord', 2015, 2025, 'Front Brake Pads', 40000, 40000, false),
('Honda', 'Accord', 2015, 2025, 'Rear Brake Pads', 70000, 50000, false),
('Honda', 'Accord', 2015, 2025, 'Brake Rotors Replacement', 70000, 70000, false),
('Honda', 'Accord', 2015, 2025, 'Transmission Fluid', 60000, 60000, true),
('Honda', 'Accord', 2015, 2025, 'Tire Rotation', 7500, 7500, false)
ON CONFLICT DO NOTHING;

-- Insert service necessity rules
INSERT INTO public.service_necessity_rules (service_pattern, typical_lifespan_miles, confidence_threshold, warning_message) VALUES
('rear brake', 70000, 0.7, 'Rear brake pads typically last 70,000-100,000 miles. Replacing them at low mileage may be unnecessary.'),
('brake rotor', 70000, 0.6, 'Brake rotors can often be resurfaced instead of replaced, saving 60-70% of the cost.'),
('transmission flush', 60000, 0.5, 'Transmission service is typically needed every 60,000 miles. Earlier service may be unnecessary unless there are symptoms.'),
('cabin air filter', 15000, 0.4, 'Cabin air filters are easy to replace yourself for $10-20 instead of $40-80 at a shop.')
ON CONFLICT DO NOTHING;

-- Function to get price benchmark for a service
CREATE OR REPLACE FUNCTION get_price_benchmark(
  p_service_name TEXT,
  p_vehicle_type TEXT DEFAULT 'sedan'
)
RETURNS TABLE (
  service TEXT,
  price_min DECIMAL,
  price_max DECIMAL,
  found BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    service_name::TEXT,
    auto_repair_prices.price_min,
    auto_repair_prices.price_max,
    true as found
  FROM public.auto_repair_prices
  WHERE
    service_name ILIKE '%' || p_service_name || '%'
    AND vehicle_type = p_vehicle_type
  LIMIT 1;

  -- If no exact match, return null values
  IF NOT FOUND THEN
    RETURN QUERY SELECT p_service_name, 0::DECIMAL, 0::DECIMAL, false;
  END IF;
END;
$$ LANGUAGE plpgsql;
