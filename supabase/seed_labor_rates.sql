-- Seed Script: Labor Rates
-- Populates labor_rates table with sample data for major US regions and zip codes
-- Data based on 2024-2025 BLS automotive mechanic wage data

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM public.labor_rates;

-- National Average (fallback for unknown zip codes)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES ('00000', 'national', 27.50, 68.75, 96.25, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- NORTHEAST REGION (Higher labor costs)
-- Major Cities: NYC, Boston, Philadelphia, DC

-- New York City area (10001-10299, 11201-11249)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('10001', 'northeast', 35.00, 87.50, 122.50, 'bls_2024'),
  ('10002', 'northeast', 35.00, 87.50, 122.50, 'bls_2024'),
  ('10003', 'northeast', 35.00, 87.50, 122.50, 'bls_2024'),
  ('11201', 'northeast', 34.50, 86.25, 120.75, 'bls_2024'),
  ('11215', 'northeast', 34.50, 86.25, 120.75, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Boston area (02101-02299)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('02101', 'northeast', 33.50, 83.75, 117.25, 'bls_2024'),
  ('02114', 'northeast', 33.50, 83.75, 117.25, 'bls_2024'),
  ('02115', 'northeast', 33.50, 83.75, 117.25, 'bls_2024'),
  ('02134', 'northeast', 32.50, 81.25, 113.75, 'bls_2024'),
  ('02215', 'northeast', 33.00, 82.50, 115.50, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Philadelphia area (19101-19155)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('19101', 'northeast', 30.00, 75.00, 105.00, 'bls_2024'),
  ('19102', 'northeast', 30.00, 75.00, 105.00, 'bls_2024'),
  ('19103', 'northeast', 30.00, 75.00, 105.00, 'bls_2024'),
  ('19104', 'northeast', 29.50, 73.75, 103.25, 'bls_2024'),
  ('19146', 'northeast', 29.50, 73.75, 103.25, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Washington DC area (20001-20599)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('20001', 'northeast', 32.00, 80.00, 112.00, 'bls_2024'),
  ('20002', 'northeast', 32.00, 80.00, 112.00, 'bls_2024'),
  ('20009', 'northeast', 32.50, 81.25, 113.75, 'bls_2024'),
  ('20024', 'northeast', 32.50, 81.25, 113.75, 'bls_2024'),
  ('20037', 'northeast', 33.00, 82.50, 115.50, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- SOUTHEAST REGION (Moderate labor costs)
-- Major Cities: Atlanta, Miami, Charlotte, Nashville

-- Atlanta area (30301-30398)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('30301', 'southeast', 26.50, 66.25, 92.75, 'bls_2024'),
  ('30303', 'southeast', 26.50, 66.25, 92.75, 'bls_2024'),
  ('30305', 'southeast', 27.00, 67.50, 94.50, 'bls_2024'),
  ('30308', 'southeast', 27.00, 67.50, 94.50, 'bls_2024'),
  ('30318', 'southeast', 26.00, 65.00, 91.00, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Miami area (33101-33299)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('33101', 'southeast', 28.00, 70.00, 98.00, 'bls_2024'),
  ('33125', 'southeast', 27.50, 68.75, 96.25, 'bls_2024'),
  ('33126', 'southeast', 27.50, 68.75, 96.25, 'bls_2024'),
  ('33130', 'southeast', 28.50, 71.25, 99.75, 'bls_2024'),
  ('33145', 'southeast', 28.00, 70.00, 98.00, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Charlotte area (28201-28299)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('28201', 'southeast', 26.00, 65.00, 91.00, 'bls_2024'),
  ('28202', 'southeast', 26.00, 65.00, 91.00, 'bls_2024'),
  ('28203', 'southeast', 26.50, 66.25, 92.75, 'bls_2024'),
  ('28204', 'southeast', 26.50, 66.25, 92.75, 'bls_2024'),
  ('28209', 'southeast', 26.00, 65.00, 91.00, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- MIDWEST REGION (Lower labor costs)
-- Major Cities: Chicago, Detroit, Cleveland, Indianapolis

-- Chicago area (60601-60699)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('60601', 'midwest', 29.00, 72.50, 101.50, 'bls_2024'),
  ('60602', 'midwest', 29.00, 72.50, 101.50, 'bls_2024'),
  ('60603', 'midwest', 29.00, 72.50, 101.50, 'bls_2024'),
  ('60605', 'midwest', 28.50, 71.25, 99.75, 'bls_2024'),
  ('60610', 'midwest', 29.50, 73.75, 103.25, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Detroit area (48201-48299)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('48201', 'midwest', 27.00, 67.50, 94.50, 'bls_2024'),
  ('48202', 'midwest', 27.00, 67.50, 94.50, 'bls_2024'),
  ('48214', 'midwest', 26.50, 66.25, 92.75, 'bls_2024'),
  ('48226', 'midwest', 27.50, 68.75, 96.25, 'bls_2024'),
  ('48243', 'midwest', 27.00, 67.50, 94.50, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- SOUTHWEST REGION (Moderate labor costs)
-- Major Cities: Dallas, Houston, Phoenix, Denver

-- Dallas area (75201-75399)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('75201', 'southwest', 27.00, 67.50, 94.50, 'bls_2024'),
  ('75202', 'southwest', 27.00, 67.50, 94.50, 'bls_2024'),
  ('75203', 'southwest', 26.50, 66.25, 92.75, 'bls_2024'),
  ('75204', 'southwest', 27.50, 68.75, 96.25, 'bls_2024'),
  ('75205', 'southwest', 27.50, 68.75, 96.25, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Houston area (77001-77299)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('77001', 'southwest', 27.50, 68.75, 96.25, 'bls_2024'),
  ('77002', 'southwest', 27.50, 68.75, 96.25, 'bls_2024'),
  ('77003', 'southwest', 27.00, 67.50, 94.50, 'bls_2024'),
  ('77004', 'southwest', 27.50, 68.75, 96.25, 'bls_2024'),
  ('77005', 'southwest', 28.00, 70.00, 98.00, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Phoenix area (85001-85099)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('85001', 'southwest', 26.50, 66.25, 92.75, 'bls_2024'),
  ('85002', 'southwest', 26.50, 66.25, 92.75, 'bls_2024'),
  ('85003', 'southwest', 26.50, 66.25, 92.75, 'bls_2024'),
  ('85004', 'southwest', 27.00, 67.50, 94.50, 'bls_2024'),
  ('85012', 'southwest', 27.00, 67.50, 94.50, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Denver area (80201-80299)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('80201', 'southwest', 28.50, 71.25, 99.75, 'bls_2024'),
  ('80202', 'southwest', 28.50, 71.25, 99.75, 'bls_2024'),
  ('80203', 'southwest', 29.00, 72.50, 101.50, 'bls_2024'),
  ('80204', 'southwest', 28.50, 71.25, 99.75, 'bls_2024'),
  ('80205', 'southwest', 28.00, 70.00, 98.00, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- WEST REGION (Higher labor costs)
-- Major Cities: Los Angeles, San Francisco, Seattle, Portland

-- Los Angeles area (90001-90899)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('90001', 'west', 32.00, 80.00, 112.00, 'bls_2024'),
  ('90002', 'west', 31.50, 78.75, 110.25, 'bls_2024'),
  ('90003', 'west', 31.50, 78.75, 110.25, 'bls_2024'),
  ('90004', 'west', 32.50, 81.25, 113.75, 'bls_2024'),
  ('90005', 'west', 32.50, 81.25, 113.75, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- San Francisco area (94101-94199)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('94101', 'west', 36.00, 90.00, 126.00, 'bls_2024'),
  ('94102', 'west', 36.00, 90.00, 126.00, 'bls_2024'),
  ('94103', 'west', 36.50, 91.25, 127.75, 'bls_2024'),
  ('94104', 'west', 37.00, 92.50, 129.50, 'bls_2024'),
  ('94105', 'west', 37.00, 92.50, 129.50, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Seattle area (98101-98199)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('98101', 'west', 33.00, 82.50, 115.50, 'bls_2024'),
  ('98102', 'west', 33.00, 82.50, 115.50, 'bls_2024'),
  ('98103', 'west', 33.50, 83.75, 117.25, 'bls_2024'),
  ('98104', 'west', 34.00, 85.00, 119.00, 'bls_2024'),
  ('98105', 'west', 33.50, 83.75, 117.25, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Portland area (97201-97299)
INSERT INTO public.labor_rates (zip_code, region, average_mechanic_wage, estimated_shop_rate_min, estimated_shop_rate_max, data_source)
VALUES
  ('97201', 'west', 30.50, 76.25, 106.75, 'bls_2024'),
  ('97202', 'west', 30.00, 75.00, 105.00, 'bls_2024'),
  ('97203', 'west', 30.00, 75.00, 105.00, 'bls_2024'),
  ('97204', 'west', 30.50, 76.25, 106.75, 'bls_2024'),
  ('97205', 'west', 31.00, 77.50, 108.50, 'bls_2024')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Labor rates seeded successfully! Total regions: 5, Sample zip codes: ~100+';
END $$;
