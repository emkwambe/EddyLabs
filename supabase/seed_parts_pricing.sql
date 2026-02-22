-- Seed Script: Parts Pricing Reference
-- Populates parts_pricing_reference table with common auto parts OEM pricing
-- Pricing based on 2024-2025 market averages for popular vehicle makes

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM public.parts_pricing_reference;

-- BRAKE PARTS
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  -- Brake Pads
  ('brake_pad', 'Front Brake Pads', 'Toyota', NULL, 2015, 2025, 45.00, 85.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Rear Brake Pads', 'Toyota', NULL, 2015, 2025, 40.00, 75.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Front Brake Pads', 'Honda', NULL, 2015, 2025, 50.00, 90.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Rear Brake Pads', 'Honda', NULL, 2015, 2025, 45.00, 80.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Front Brake Pads', 'Ford', NULL, 2015, 2025, 55.00, 95.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Rear Brake Pads', 'Ford', NULL, 2015, 2025, 50.00, 85.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Front Brake Pads', 'Chevrolet', NULL, 2015, 2025, 55.00, 95.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Rear Brake Pads', 'Chevrolet', NULL, 2015, 2025, 50.00, 85.00, 75, 'oem_catalog_2024'),
  ('brake_pad', 'Front Brake Pads', 'BMW', NULL, 2015, 2025, 85.00, 150.00, 65, 'oem_catalog_2024'),
  ('brake_pad', 'Rear Brake Pads', 'BMW', NULL, 2015, 2025, 75.00, 135.00, 65, 'oem_catalog_2024'),
  ('brake_pad', 'Front Brake Pads', 'Mercedes-Benz', NULL, 2015, 2025, 90.00, 160.00, 65, 'oem_catalog_2024'),
  ('brake_pad', 'Rear Brake Pads', 'Mercedes-Benz', NULL, 2015, 2025, 80.00, 145.00, 65, 'oem_catalog_2024'),

  -- Brake Rotors
  ('brake_rotor', 'Front Brake Rotor (Each)', 'Toyota', NULL, 2015, 2025, 60.00, 110.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Rear Brake Rotor (Each)', 'Toyota', NULL, 2015, 2025, 55.00, 100.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Front Brake Rotor (Each)', 'Honda', NULL, 2015, 2025, 65.00, 115.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Rear Brake Rotor (Each)', 'Honda', NULL, 2015, 2025, 60.00, 105.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Front Brake Rotor (Each)', 'Ford', NULL, 2015, 2025, 70.00, 120.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Rear Brake Rotor (Each)', 'Ford', NULL, 2015, 2025, 65.00, 110.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Front Brake Rotor (Each)', 'Chevrolet', NULL, 2015, 2025, 70.00, 120.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Rear Brake Rotor (Each)', 'Chevrolet', NULL, 2015, 2025, 65.00, 110.00, 80, 'oem_catalog_2024'),
  ('brake_rotor', 'Front Brake Rotor (Each)', 'BMW', NULL, 2015, 2025, 120.00, 200.00, 70, 'oem_catalog_2024'),
  ('brake_rotor', 'Rear Brake Rotor (Each)', 'BMW', NULL, 2015, 2025, 110.00, 185.00, 70, 'oem_catalog_2024'),
  ('brake_rotor', 'Front Brake Rotor (Each)', 'Mercedes-Benz', NULL, 2015, 2025, 130.00, 210.00, 70, 'oem_catalog_2024'),
  ('brake_rotor', 'Rear Brake Rotor (Each)', 'Mercedes-Benz', NULL, 2015, 2025, 120.00, 195.00, 70, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- FILTERS AND FLUIDS
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  -- Oil Filters
  ('oil_filter', 'Oil Filter', 'Toyota', NULL, 2015, 2025, 8.00, 15.00, 100, 'oem_catalog_2024'),
  ('oil_filter', 'Oil Filter', 'Honda', NULL, 2015, 2025, 9.00, 16.00, 100, 'oem_catalog_2024'),
  ('oil_filter', 'Oil Filter', 'Ford', NULL, 2015, 2025, 10.00, 18.00, 100, 'oem_catalog_2024'),
  ('oil_filter', 'Oil Filter', 'Chevrolet', NULL, 2015, 2025, 10.00, 18.00, 100, 'oem_catalog_2024'),
  ('oil_filter', 'Oil Filter', 'BMW', NULL, 2015, 2025, 15.00, 25.00, 80, 'oem_catalog_2024'),
  ('oil_filter', 'Oil Filter', 'Mercedes-Benz', NULL, 2015, 2025, 16.00, 28.00, 80, 'oem_catalog_2024'),

  -- Air Filters
  ('air_filter', 'Engine Air Filter', 'Toyota', NULL, 2015, 2025, 15.00, 30.00, 100, 'oem_catalog_2024'),
  ('air_filter', 'Engine Air Filter', 'Honda', NULL, 2015, 2025, 16.00, 32.00, 100, 'oem_catalog_2024'),
  ('air_filter', 'Engine Air Filter', 'Ford', NULL, 2015, 2025, 18.00, 35.00, 100, 'oem_catalog_2024'),
  ('air_filter', 'Engine Air Filter', 'Chevrolet', NULL, 2015, 2025, 18.00, 35.00, 100, 'oem_catalog_2024'),
  ('air_filter', 'Engine Air Filter', 'BMW', NULL, 2015, 2025, 25.00, 45.00, 80, 'oem_catalog_2024'),
  ('air_filter', 'Engine Air Filter', 'Mercedes-Benz', NULL, 2015, 2025, 27.00, 50.00, 80, 'oem_catalog_2024'),

  -- Cabin Air Filters
  ('cabin_air_filter', 'Cabin Air Filter', 'Toyota', NULL, 2015, 2025, 12.00, 25.00, 100, 'oem_catalog_2024'),
  ('cabin_air_filter', 'Cabin Air Filter', 'Honda', NULL, 2015, 2025, 13.00, 27.00, 100, 'oem_catalog_2024'),
  ('cabin_air_filter', 'Cabin Air Filter', 'Ford', NULL, 2015, 2025, 14.00, 28.00, 100, 'oem_catalog_2024'),
  ('cabin_air_filter', 'Cabin Air Filter', 'Chevrolet', NULL, 2015, 2025, 14.00, 28.00, 100, 'oem_catalog_2024'),
  ('cabin_air_filter', 'Cabin Air Filter', 'BMW', NULL, 2015, 2025, 20.00, 40.00, 80, 'oem_catalog_2024'),
  ('cabin_air_filter', 'Cabin Air Filter', 'Mercedes-Benz', NULL, 2015, 2025, 22.00, 42.00, 80, 'oem_catalog_2024'),

  -- Motor Oil (per quart)
  ('motor_oil', 'Conventional Motor Oil (per quart)', 'Toyota', NULL, 2015, 2025, 5.00, 8.00, 100, 'oem_catalog_2024'),
  ('motor_oil', 'Synthetic Motor Oil (per quart)', 'Toyota', NULL, 2015, 2025, 8.00, 12.00, 90, 'oem_catalog_2024'),
  ('motor_oil', 'Conventional Motor Oil (per quart)', 'Honda', NULL, 2015, 2025, 5.00, 8.00, 100, 'oem_catalog_2024'),
  ('motor_oil', 'Synthetic Motor Oil (per quart)', 'Honda', NULL, 2015, 2025, 8.00, 12.00, 90, 'oem_catalog_2024'),
  ('motor_oil', 'Conventional Motor Oil (per quart)', 'Ford', NULL, 2015, 2025, 5.50, 8.50, 100, 'oem_catalog_2024'),
  ('motor_oil', 'Synthetic Motor Oil (per quart)', 'Ford', NULL, 2015, 2025, 8.50, 13.00, 90, 'oem_catalog_2024'),
  ('motor_oil', 'Synthetic Motor Oil (per quart)', 'BMW', NULL, 2015, 2025, 10.00, 15.00, 80, 'oem_catalog_2024'),
  ('motor_oil', 'Synthetic Motor Oil (per quart)', 'Mercedes-Benz', NULL, 2015, 2025, 10.50, 16.00, 80, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- BATTERIES
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  ('battery', 'Battery - Standard', 'Toyota', NULL, 2015, 2025, 80.00, 150.00, 70, 'oem_catalog_2024'),
  ('battery', 'Battery - Standard', 'Honda', NULL, 2015, 2025, 85.00, 155.00, 70, 'oem_catalog_2024'),
  ('battery', 'Battery - Standard', 'Ford', NULL, 2015, 2025, 90.00, 160.00, 70, 'oem_catalog_2024'),
  ('battery', 'Battery - Standard', 'Chevrolet', NULL, 2015, 2025, 90.00, 160.00, 70, 'oem_catalog_2024'),
  ('battery', 'Battery - Premium', 'BMW', NULL, 2015, 2025, 150.00, 250.00, 60, 'oem_catalog_2024'),
  ('battery', 'Battery - Premium', 'Mercedes-Benz', NULL, 2015, 2025, 160.00, 260.00, 60, 'oem_catalog_2024'),
  ('battery', 'Battery - AGM', 'BMW', NULL, 2015, 2025, 200.00, 350.00, 55, 'oem_catalog_2024'),
  ('battery', 'Battery - AGM', 'Mercedes-Benz', NULL, 2015, 2025, 210.00, 360.00, 55, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- SPARK PLUGS
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  ('spark_plug', 'Spark Plug (Each)', 'Toyota', NULL, 2015, 2025, 8.00, 15.00, 100, 'oem_catalog_2024'),
  ('spark_plug', 'Spark Plug (Each)', 'Honda', NULL, 2015, 2025, 9.00, 16.00, 100, 'oem_catalog_2024'),
  ('spark_plug', 'Spark Plug (Each)', 'Ford', NULL, 2015, 2025, 10.00, 18.00, 100, 'oem_catalog_2024'),
  ('spark_plug', 'Spark Plug (Each)', 'Chevrolet', NULL, 2015, 2025, 10.00, 18.00, 100, 'oem_catalog_2024'),
  ('spark_plug', 'Spark Plug - Iridium (Each)', 'BMW', NULL, 2015, 2025, 18.00, 30.00, 80, 'oem_catalog_2024'),
  ('spark_plug', 'Spark Plug - Iridium (Each)', 'Mercedes-Benz', NULL, 2015, 2025, 20.00, 32.00, 80, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- WIPER BLADES
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  ('wiper_blade', 'Wiper Blade (Each)', 'Toyota', NULL, 2015, 2025, 12.00, 25.00, 100, 'oem_catalog_2024'),
  ('wiper_blade', 'Wiper Blade (Each)', 'Honda', NULL, 2015, 2025, 13.00, 26.00, 100, 'oem_catalog_2024'),
  ('wiper_blade', 'Wiper Blade (Each)', 'Ford', NULL, 2015, 2025, 14.00, 28.00, 100, 'oem_catalog_2024'),
  ('wiper_blade', 'Wiper Blade (Each)', 'Chevrolet', NULL, 2015, 2025, 14.00, 28.00, 100, 'oem_catalog_2024'),
  ('wiper_blade', 'Wiper Blade (Each)', 'BMW', NULL, 2015, 2025, 20.00, 40.00, 80, 'oem_catalog_2024'),
  ('wiper_blade', 'Wiper Blade (Each)', 'Mercedes-Benz', NULL, 2015, 2025, 22.00, 42.00, 80, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- BELTS AND HOSES
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  -- Serpentine Belts
  ('serpentine_belt', 'Serpentine Belt', 'Toyota', NULL, 2015, 2025, 25.00, 50.00, 90, 'oem_catalog_2024'),
  ('serpentine_belt', 'Serpentine Belt', 'Honda', NULL, 2015, 2025, 27.00, 52.00, 90, 'oem_catalog_2024'),
  ('serpentine_belt', 'Serpentine Belt', 'Ford', NULL, 2015, 2025, 30.00, 55.00, 90, 'oem_catalog_2024'),
  ('serpentine_belt', 'Serpentine Belt', 'Chevrolet', NULL, 2015, 2025, 30.00, 55.00, 90, 'oem_catalog_2024'),
  ('serpentine_belt', 'Serpentine Belt', 'BMW', NULL, 2015, 2025, 45.00, 75.00, 75, 'oem_catalog_2024'),
  ('serpentine_belt', 'Serpentine Belt', 'Mercedes-Benz', NULL, 2015, 2025, 48.00, 80.00, 75, 'oem_catalog_2024'),

  -- Timing Belts
  ('timing_belt', 'Timing Belt Kit', 'Toyota', NULL, 2015, 2025, 150.00, 300.00, 70, 'oem_catalog_2024'),
  ('timing_belt', 'Timing Belt Kit', 'Honda', NULL, 2015, 2025, 160.00, 310.00, 70, 'oem_catalog_2024'),
  ('timing_belt', 'Timing Belt Kit', 'Ford', NULL, 2015, 2025, 170.00, 320.00, 70, 'oem_catalog_2024'),
  ('timing_belt', 'Timing Belt Kit', 'Chevrolet', NULL, 2015, 2025, 170.00, 320.00, 70, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- TIRES (common sizes)
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  ('tire', 'Tire - 15 inch (Standard)', NULL, NULL, 2015, 2025, 70.00, 120.00, 60, 'oem_catalog_2024'),
  ('tire', 'Tire - 16 inch (Standard)', NULL, NULL, 2015, 2025, 80.00, 135.00, 60, 'oem_catalog_2024'),
  ('tire', 'Tire - 17 inch (Standard)', NULL, NULL, 2015, 2025, 90.00, 150.00, 60, 'oem_catalog_2024'),
  ('tire', 'Tire - 18 inch (Standard)', NULL, NULL, 2015, 2025, 100.00, 170.00, 60, 'oem_catalog_2024'),
  ('tire', 'Tire - 19 inch (Performance)', NULL, NULL, 2015, 2025, 150.00, 250.00, 50, 'oem_catalog_2024'),
  ('tire', 'Tire - 20 inch (Performance)', NULL, NULL, 2015, 2025, 180.00, 300.00, 50, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- SUSPENSION PARTS
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  -- Shock Absorbers
  ('shock_absorber', 'Shock Absorber (Each)', 'Toyota', NULL, 2015, 2025, 60.00, 120.00, 75, 'oem_catalog_2024'),
  ('shock_absorber', 'Shock Absorber (Each)', 'Honda', NULL, 2015, 2025, 65.00, 125.00, 75, 'oem_catalog_2024'),
  ('shock_absorber', 'Shock Absorber (Each)', 'Ford', NULL, 2015, 2025, 70.00, 130.00, 75, 'oem_catalog_2024'),
  ('shock_absorber', 'Shock Absorber (Each)', 'BMW', NULL, 2015, 2025, 120.00, 200.00, 65, 'oem_catalog_2024'),
  ('shock_absorber', 'Shock Absorber (Each)', 'Mercedes-Benz', NULL, 2015, 2025, 130.00, 210.00, 65, 'oem_catalog_2024'),

  -- Struts
  ('strut', 'Strut Assembly (Each)', 'Toyota', NULL, 2015, 2025, 100.00, 200.00, 70, 'oem_catalog_2024'),
  ('strut', 'Strut Assembly (Each)', 'Honda', NULL, 2015, 2025, 110.00, 210.00, 70, 'oem_catalog_2024'),
  ('strut', 'Strut Assembly (Each)', 'Ford', NULL, 2015, 2025, 120.00, 220.00, 70, 'oem_catalog_2024'),
  ('strut', 'Strut Assembly (Each)', 'BMW', NULL, 2015, 2025, 200.00, 350.00, 60, 'oem_catalog_2024'),
  ('strut', 'Strut Assembly (Each)', 'Mercedes-Benz', NULL, 2015, 2025, 220.00, 370.00, 60, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- TRANSMISSION FLUIDS AND COOLANT
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model, year_min, year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  ('transmission_fluid', 'Transmission Fluid (per quart)', 'Toyota', NULL, 2015, 2025, 8.00, 15.00, 90, 'oem_catalog_2024'),
  ('transmission_fluid', 'Transmission Fluid (per quart)', 'Honda', NULL, 2015, 2025, 9.00, 16.00, 90, 'oem_catalog_2024'),
  ('transmission_fluid', 'Transmission Fluid (per quart)', 'Ford', NULL, 2015, 2025, 10.00, 18.00, 90, 'oem_catalog_2024'),
  ('transmission_fluid', 'Transmission Fluid (per quart)', 'BMW', NULL, 2015, 2025, 15.00, 25.00, 80, 'oem_catalog_2024'),
  ('transmission_fluid', 'Transmission Fluid (per quart)', 'Mercedes-Benz', NULL, 2015, 2025, 16.00, 27.00, 80, 'oem_catalog_2024'),

  ('coolant', 'Coolant/Antifreeze (per gallon)', 'Toyota', NULL, 2015, 2025, 15.00, 30.00, 85, 'oem_catalog_2024'),
  ('coolant', 'Coolant/Antifreeze (per gallon)', 'Honda', NULL, 2015, 2025, 16.00, 32.00, 85, 'oem_catalog_2024'),
  ('coolant', 'Coolant/Antifreeze (per gallon)', 'Ford', NULL, 2015, 2025, 18.00, 35.00, 85, 'oem_catalog_2024'),
  ('coolant', 'Coolant/Antifreeze (per gallon)', 'BMW', NULL, 2015, 2025, 25.00, 45.00, 75, 'oem_catalog_2024'),
  ('coolant', 'Coolant/Antifreeze (per gallon)', 'Mercedes-Benz', NULL, 2015, 2025, 27.00, 48.00, 75, 'oem_catalog_2024')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
DECLARE
  part_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO part_count FROM public.parts_pricing_reference;
  RAISE NOTICE 'Parts pricing seeded successfully! Total parts in database: %', part_count;
END $$;
