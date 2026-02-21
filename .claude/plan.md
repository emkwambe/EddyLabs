# RedFlagRadar MVP: Auto Repair Estimate Auditor

## Direction
**Single vertical: Auto Repair Estimates.** The #1 consumer complaint category for 9 consecutive years. $150B industry. No consumer-side estimate auditor exists. We are building the tool that RepairPal should have been but for the consumer, not the shop.

**Revenue:** Performance-based (% of confirmed savings) to start. B2B hybrid layer later.

**Positioning:** "Is your mechanic overcharging you? Upload your estimate. Find out in 60 seconds."

---

## Current State (What Exists)

The backend already has rich AI analysis capabilities that are **not displayed in the UI**:
- `fee_analysis` - fee totals, industry comparison, suspicious indicators
- `double_billing_check` - duplicate charges, diagnostic vs labor overlap
- `price_comparison` - estimate total vs fair market range, overcharge detection
- `shop_reputation` - ratings, reviews, trust score, warnings
- `vehicle_info` / `shop_info` in extracted_fields - captured but not shown

The results page only shows: summary, risk score, red flags, basic cost breakdown, recommendations.

---

## Implementation Plan

### Phase 1: Unlock Hidden Analysis Features in UI
**Goal:** Surface all the backend data the AI already generates

**Modify:** `/src/app/analyses/[id]/page.tsx`

Add these sections to the analysis results page:

1. **Savings Callout** (top of page, below header)
   - Big number: "Potential Savings: $XXX"
   - Your estimate vs fair market range
   - CTA buttons: "Generate Counter-Offer" | "Find Second Opinion"

2. **Price Comparison Gauge**
   - Visual bar showing where estimate sits relative to fair range
   - Green/yellow/red zones
   - Confidence score indicator

3. **Fee Analysis Panel**
   - Total fees, fee percentage of estimate
   - Industry standard comparison
   - Estimated overcharge amount
   - Reasoning text

4. **Double Billing Alert**
   - Flag duplicate charges (diagnostic fee + labor overlap)
   - Potential savings from removing duplicates
   - Explanation of what was found

5. **Shop Reputation Card**
   - Star rating, review count
   - Trust score (0-100)
   - Verified business badge
   - Warnings list
   - Recent review snippets

6. **Vehicle & Shop Context** (header area)
   - Vehicle: year, make, model, mileage
   - Shop: name, address, phone

**New Components:**
- `/src/components/analysis/SavingsCallout.tsx`
- `/src/components/analysis/PricingGauge.tsx`
- `/src/components/analysis/FeeAnalysisPanel.tsx`
- `/src/components/analysis/DoubleBillingAlert.tsx`
- `/src/components/analysis/ShopReputationCard.tsx`
- `/src/components/analysis/VehicleShopContext.tsx`

---

### Phase 2: Auto Repair Pricing Database
**Goal:** Real benchmark data so price comparisons are accurate, not AI guesses

**New Table:**
```sql
CREATE TABLE auto_repair_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category TEXT NOT NULL,    -- 'brakes', 'engine', 'transmission', etc.
  service_type TEXT NOT NULL,        -- 'brake_pad_replacement', 'oil_change', etc.
  service_label TEXT NOT NULL,       -- 'Brake Pad Replacement (Front)'
  make TEXT,                         -- NULL = all makes
  model TEXT,                        -- NULL = all models
  year_min INTEGER,
  year_max INTEGER,
  region TEXT DEFAULT 'national',    -- 'national', 'northeast', 'southeast', etc.
  fair_price_min DECIMAL(10,2) NOT NULL,
  fair_price_max DECIMAL(10,2) NOT NULL,
  labor_hours_min DECIMAL(4,2),
  labor_hours_max DECIMAL(4,2),
  labor_rate_min DECIMAL(6,2),       -- $/hr shop rate
  labor_rate_max DECIMAL(6,2),
  parts_cost_min DECIMAL(10,2),
  parts_cost_max DECIMAL(10,2),
  data_source TEXT NOT NULL,
  confidence INTEGER DEFAULT 70,     -- 0-100
  last_updated TIMESTAMP DEFAULT NOW()
);
```

**Seed data:** 30+ common auto repair services with national pricing from AAA, KBB, CarMD public data:
- Brakes (pads, rotors, calipers)
- Oil change (conventional, synthetic)
- Tires (rotation, alignment, replacement)
- Battery replacement
- Alternator replacement
- Starter replacement
- Transmission flush/repair
- AC recharge/repair
- Engine diagnostics
- Spark plugs
- Timing belt
- Suspension (struts, shocks)
- Exhaust system
- Water pump
- Radiator
- Head gasket
- Fuel pump
- And more...

**New Files:**
- `/src/lib/pricing/auto-repair-db.ts` - query functions for pricing lookup
- `/src/lib/pricing/price-matcher.ts` - fuzzy match line items to known services
- `/scripts/seed-auto-pricing.ts` - seeding script
- Supabase migration for the table

**Modify:** AI analyzer to use real pricing data when generating `price_comparison`

---

### Phase 3: Redesigned Results Page Layout
**Goal:** Consumer-grade UI focused on auto repair estimates

**New page layout:**
```
┌─────────────────────────────────────────────────┐
│ [Vehicle Info] 2019 Honda Accord | 45,000 mi    │
│ [Shop Info] ABC Auto Repair - (555) 123-4567    │
│ Risk: HIGH CONCERN                               │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ POTENTIAL SAVINGS: $295                          │
│ Your Estimate: $1,245 | Fair Market: $750-$950  │
│ [Generate Counter-Offer] [Find Second Opinion]  │
└─────────────────────────────────────────────────┘
┌────────────────────┬────────────────────────────┐
│ PRICING ANALYSIS   │ SHOP REPUTATION            │
│ [Gauge Component]  │ 4.2 stars (127 reviews)    │
│ Fee Analysis       │ Trust Score: 68/100        │
│ Double Billing     │ Warnings: 3 BBB complaints │
└────────────────────┴────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ RED FLAGS (3 found)                              │
│ [flag cards with severity, explanation, snippet] │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ LINE-BY-LINE BREAKDOWN                           │
│ [Enhanced table with fair price column + flags]  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ WHAT TO DO NEXT                                  │
│ [Negotiate] [Second Opinion] [File Complaint]    │
└─────────────────────────────────────────────────┘
```

**Key UI improvements:**
- Add "Fair Price" column to cost breakdown table (each line item compared to DB)
- Flag overpriced rows with red highlight
- Collapsible sections on mobile
- Savings callout sticky on scroll

---

### Phase 4: "Fight Back" Features
**Goal:** Help users take action, not just read analysis

**4a. Counter-Offer Letter Generator**
- New API endpoint: `/api/analyses/[id]/counter-offer`
- AI generates professional negotiation letter citing:
  - Specific overpriced line items
  - Fair market pricing data with sources
  - Proposed counter-offer amount
  - Request for itemized justification
- UI: Modal with generated letter, copy button, email (mailto:) button, print button
- Component: `/src/components/analysis/CounterOfferGenerator.tsx`

**4b. Second Opinion Finder**
- New API endpoint: `/api/shops/nearby`
- Uses Google Places API to find auto repair shops near user's zip
- Shows 3-5 shops with ratings, reviews, distance
- Displays estimated price range for same service (from our pricing DB)
- Component: `/src/components/analysis/SecondOpinionFinder.tsx`

**4c. Complaint Letter Generator**
- New API endpoint: `/api/analyses/[id]/complaint`
- Generates formal complaint for BBB or state Attorney General
- Includes state AG contact database (50 states)
- Component: `/src/components/analysis/ComplaintGenerator.tsx`

**Action Center Component:** `/src/components/analysis/ActionCenter.tsx`
- Tabbed interface housing all three features
- Located at bottom of analysis results page

---

### Phase 5: Outcome Tracking & Savings Proof
**Goal:** Track whether users actually saved money (required for performance pricing)

**New Table:**
```sql
CREATE TABLE analysis_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL,
  original_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  savings_amount DECIMAL(10,2),
  action_taken TEXT,
  notes TEXT,
  reported_at TIMESTAMP DEFAULT NOW()
);
```

**Features:**
- Outcome reporting modal (triggered on revisit after 7+ days)
- Savings tracker page: `/dashboard/savings`
- Admin metrics: total savings, conversion rate, avg savings per analysis

---

### Phase 6: Landing Page - Auto Repair Focused
**Goal:** Clear positioning, conversion-optimized

Rewrite `/src/app/page.tsx` with:
- Hero: "Is Your Mechanic Overcharging You?"
- Problem stats: "$5.8B in unnecessary repairs annually"
- How it works: Upload → Analyze → Fight Back
- Social proof (savings testimonials)
- Pricing: "Free analysis. Pay only if we save you money."
- Trust signals

---

### Phase 7: Performance-Based Pricing (Stripe)
**Goal:** Monetize via % of confirmed savings

- Free tier: 3 analyses/month
- Performance tier: unlimited, 25% of confirmed savings
- Subscription tier: $9.99/mo, no performance fees
- Stripe integration for payments
- Billing history page

---

### Phase 8: B2B API Layer
**Goal:** Enable enterprise clients (insurance cos, credit unions)

- Public REST API with API key auth
- Rate limiting (1000 req/day)
- White-label tenant config
- Embeddable widget

---

## Implementation Order

**Session 1 (Now): Phases 1-3**
- Unlock hidden features in UI
- Seed auto repair pricing database
- Redesign results page layout

**Session 2: Phase 4**
- Counter-offer generator
- Second opinion finder
- Complaint generator

**Session 3: Phases 5-6**
- Outcome tracking
- Landing page redesign

**Session 4: Phases 7-8**
- Stripe integration
- B2B API layer

---

## What We're NOT Building (Yet)
- Medical bill analysis (future vertical)
- Contractor estimate review (future vertical)
- Mobile app (web only, responsive)
- Email automation
- HIPAA compliance
- Shop partnerships
- ML model training
