# Phase 4 Database Seeding Guide

This guide explains how to populate your Phase 4 pricing tables with starter data.

---

## 📊 **What Gets Seeded:**

### 1. **Labor Rates Table** (`seed_labor_rates.sql`)
- **~100+ zip codes** across 5 US regions
- **Market labor rates** based on 2024-2025 BLS data
- **Regions covered:**
  - Northeast (NYC, Boston, Philly, DC)
  - Southeast (Atlanta, Miami, Charlotte)
  - Midwest (Chicago, Detroit, Cleveland)
  - Southwest (Dallas, Houston, Phoenix, Denver)
  - West (LA, SF, Seattle, Portland)

### 2. **Parts Pricing Reference** (`seed_parts_pricing.sql`)
- **~150+ common auto parts** with OEM pricing
- **Parts categories:**
  - Brake parts (pads, rotors)
  - Filters (oil, air, cabin air)
  - Batteries
  - Spark plugs
  - Wiper blades
  - Belts (serpentine, timing)
  - Tires
  - Suspension (shocks, struts)
  - Fluids (oil, transmission fluid, coolant)
- **Popular makes:** Toyota, Honda, Ford, Chevrolet, BMW, Mercedes-Benz
- **Model years:** 2015-2025

---

## 🚀 **How to Run the Seeds:**

### **Option 1: Run in Supabase SQL Editor** (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (in left sidebar)
3. Click **New query**
4. Copy and paste the content of `seed_labor_rates.sql`
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Repeat steps 3-5 for `seed_parts_pricing.sql`

### **Option 2: Run Locally with psql**

```bash
# From your project root
psql -h your-supabase-host -U postgres -d postgres -f supabase/seed_labor_rates.sql
psql -h your-supabase-host -U postgres -d postgres -f supabase/seed_parts_pricing.sql
```

### **Option 3: Run Both at Once**

Create a combined script:
```bash
cat supabase/seed_labor_rates.sql supabase/seed_parts_pricing.sql > supabase/seed_all.sql
```

Then run in Supabase SQL Editor.

---

## ✅ **Verify the Seeds:**

After running, verify the data:

```sql
-- Check labor rates
SELECT region, COUNT(*) as zip_count
FROM public.labor_rates
GROUP BY region;

-- Should show:
-- national: 1
-- northeast: ~25
-- southeast: ~20
-- midwest: ~15
-- southwest: ~25
-- west: ~20

-- Check parts pricing
SELECT part_category, COUNT(*) as part_count
FROM public.parts_pricing_reference
GROUP BY part_category;

-- Should show multiple categories with counts
```

---

## 🔄 **Update vs Insert:**

The scripts use `ON CONFLICT DO UPDATE` for labor rates and `ON CONFLICT DO NOTHING` for parts pricing. This means:

- **Labor rates:** Re-running will update existing zip codes with new data
- **Parts pricing:** Re-running will skip duplicates, only add new parts

To completely reset:
```sql
DELETE FROM public.labor_rates;
DELETE FROM public.parts_pricing_reference;
```
Then run the seed scripts again.

---

## 💡 **How the Data is Used:**

### **Labor Rates:**
1. User uploads auto repair estimate with shop zip code
2. System queries `labor_rates` table by zip code
3. Falls back to regional average if exact zip not found
4. Falls back to national average if region not found
5. Compares shop's labor rate vs market range

### **Parts Pricing:**
1. System identifies parts in line items
2. Queries `parts_pricing_reference` by:
   - Part category (brake_pad, oil_filter, etc.)
   - Vehicle make (if available)
   - Model year range
3. Calculates OEM cost estimate
4. Compares to charged price
5. Flags excessive markup (>100%)

---

## 📈 **Expanding the Data:**

### **Add More Zip Codes:**

```sql
INSERT INTO public.labor_rates (
  zip_code, region, average_mechanic_wage,
  estimated_shop_rate_min, estimated_shop_rate_max, data_source
) VALUES
  ('YOUR_ZIP', 'region_name', 28.50, 71.25, 99.75, 'manual')
ON CONFLICT (zip_code) DO UPDATE SET
  average_mechanic_wage = EXCLUDED.average_mechanic_wage,
  estimated_shop_rate_min = EXCLUDED.estimated_shop_rate_min,
  estimated_shop_rate_max = EXCLUDED.estimated_shop_rate_max,
  last_updated = NOW();
```

### **Add More Parts:**

```sql
INSERT INTO public.parts_pricing_reference (
  part_category, part_name, make, model_year_min, model_year_max,
  oem_price_min, oem_price_max, typical_markup_percentage, data_source
) VALUES
  ('part_category', 'Part Name', 'Make', 2015, 2025,
   50.00, 100.00, 75, 'manual')
ON CONFLICT DO NOTHING;
```

---

## 🎯 **Next Steps After Seeding:**

1. ✅ Database tables created (`phase4_pricing_integration.sql`)
2. ✅ Database seeded with fallback data (these scripts)
3. 🔑 Configure API keys in `.env`:
   ```bash
   BLS_API_KEY=your_bls_key
   VEHICLEDATABASES_API_KEY=your_vehicledatabases_key
   ```
4. 🧪 Test with a real auto repair estimate
5. 🎉 Verify Labor Rate and Parts Markup cards appear!

---

## 📞 **Need More Data?**

The seed scripts provide comprehensive starter data for major US markets. For production:

1. **Add your target markets** (specific zip codes)
2. **Configure BLS API** for real-time wage data
3. **Configure VehicleDatabases API** for real-time parts pricing
4. System will automatically use API data when available, fallback to seeded data otherwise

---

**Questions?** Check the main README or create an issue on GitHub!
