/**
 * Sample document text extracted from various contract types
 * Used for testing OCR and AI analysis without needing actual PDFs
 */

export const sampleConstructionContract = `
CONSTRUCTION CONTRACT AGREEMENT

Project: Residential Home Construction
Address: 123 Main Street, Anytown, USA
Contract Date: January 15, 2024

PARTIES:
Contractor: ABC Construction LLC
Client: John Doe

SCOPE OF WORK:
Complete construction of a 2,500 sq ft single-family home including:
- Foundation and framing
- Electrical and plumbing systems
- HVAC installation
- Interior finishing
- Exterior landscaping

PAYMENT TERMS:
Total Contract Amount: $450,000

Payment Schedule:
- Deposit (30%): $135,000 - Due upon signing
- Foundation Complete: $90,000
- Framing Complete: $90,000
- Rough-ins Complete: $67,500
- Final Payment: $67,500 - Due upon completion

TIMELINE:
Start Date: February 1, 2024
Expected Completion: August 31, 2024 (7 months)

ADDITIONAL FEES:
- Change Order Fee: $150/hour
- Rush Fee: 20% surcharge for expedited work
- Storage Fee: $500/month if materials stored on-site beyond 30 days
- Document Processing Fee: $250 (non-refundable)

TERMINATION CLAUSE:
Client may terminate with 30 days written notice. Contractor retains all payments made to date plus 25% termination fee.

RED FLAGS:
- Large upfront deposit (30% is higher than typical 10-15%)
- Vague termination clause with 25% penalty
- Non-refundable processing fee
- No warranty information
- No dispute resolution clause
`;

export const sampleServiceAgreement = `
SOFTWARE DEVELOPMENT SERVICE AGREEMENT

Client: TechStart Inc.
Service Provider: Digital Solutions Co.
Effective Date: March 1, 2024

SERVICES:
Development of custom e-commerce platform including:
- User authentication system
- Product catalog management
- Payment processing integration
- Order management system
- Admin dashboard

PROJECT COST: $75,000

PAYMENT STRUCTURE:
- Initial deposit: $37,500 (50%) - Non-refundable
- Milestone 1 (Design approval): $15,000
- Milestone 2 (Backend complete): $12,500
- Final payment: $10,000

TIMELINE: 4 months from signing

INTELLECTUAL PROPERTY:
All source code remains property of Digital Solutions Co. unless full payment received.
Client receives limited usage license.

SUPPORT & MAINTENANCE:
- First 30 days: Included
- After 30 days: $2,500/month (mandatory 12-month commitment)
- Emergency support: $300/hour (2-hour minimum)

LIABILITY:
Service Provider liability limited to contract value. No liability for indirect or consequential damages.

AUTOMATIC RENEWAL:
Contract automatically renews annually at 15% rate increase unless terminated 90 days prior to renewal date.

WARNING SIGNS:
- 50% non-refundable deposit
- IP retained by provider
- Mandatory 12-month maintenance commitment
- Auto-renewal with rate increase
- Very limited liability
`;

export const sampleLeaseAgreement = `
COMMERCIAL LEASE AGREEMENT

Property: Suite 200, 456 Business Plaza, Metro City
Landlord: Property Holdings LLC
Tenant: Small Business Corp
Lease Term: 5 years starting April 1, 2024

RENT:
Base Rent: $5,000/month
Security Deposit: $15,000 (3 months)
First Month: $5,000
Last Month: $5,000
TOTAL DUE AT SIGNING: $25,000

RENT ESCALATION:
- Year 2: 8% increase ($5,400/month)
- Year 3: 8% increase ($5,832/month)
- Year 4: 8% increase ($6,299/month)
- Year 5: 8% increase ($6,803/month)

ADDITIONAL COSTS:
- CAM (Common Area Maintenance): $800/month (variable)
- Property Tax Pass-through: Estimated $400/month
- Insurance: $150/month
- Parking: $200/space/month (2 spaces required minimum)
- HVAC after-hours: $75/hour

TOTAL ESTIMATED MONTHLY: $7,150 (first year)

EARLY TERMINATION:
Not permitted. Tenant liable for all remaining rent if vacated early.
Subletting requires landlord approval and $2,000 processing fee.

RENEWAL:
Landlord has sole discretion. Must notify 180 days before lease end.

CONCERNS:
- Very high security deposit (3 months)
- 8% annual increases (above market)
- No early termination option
- Required minimum parking at additional cost
- Variable CAM fees with no cap
`;

export const sampleFreelanceContract = `
FREELANCE CONSULTING AGREEMENT

Consultant: Jane Smith (Graphic Designer)
Client: Marketing Agency XYZ
Date: February 15, 2024

PROJECT: Brand identity redesign for client's new product line

DELIVERABLES:
- Logo design (3 concepts)
- Color palette
- Typography guidelines
- Business card design
- Letterhead design

FEE STRUCTURE:
Total Project Fee: $8,500

Payment Terms:
- Deposit: $4,250 (50%) - Due before work begins
- Final Payment: $4,250 - Due upon delivery

REVISIONS:
- Included: 2 rounds of revisions per deliverable
- Additional revisions: $150/hour

TIMELINE:
- Initial concepts: 2 weeks
- Final delivery: 4 weeks from approval

RUSH FEES:
- Expedited delivery (under 3 weeks): Additional $1,500
- Weekend/Holiday work: Additional $2,000

KILL FEE:
If project cancelled after work begins, consultant keeps 100% of deposit plus 50% of remaining balance.

USAGE RIGHTS:
Client receives rights upon FULL payment only. Consultant retains portfolio rights.

EXPENSES:
Client reimburses stock photos, fonts, printing costs. Estimated $500-1,000.

ISSUES:
- High deposit (50%)
- Expensive rush fees
- Severe kill fee terms
- No refund provision if work unsatisfactory
- Vague expense reimbursement
`;

export const sampleVendorContract = `
EVENT VENDOR AGREEMENT

Event: Corporate Annual Gala
Vendor: Premier Catering Services
Client: Fortune 500 Company
Event Date: June 15, 2024

SERVICES PROVIDED:
- Full catering for 200 guests
- Appetizers, dinner, dessert
- Bar service (4 hours)
- Service staff (6 servers, 2 bartenders)
- Table settings and centerpieces

PRICING:
Per Person Rate: $185
Guest Count: 200
Subtotal: $37,000

Additional Fees:
- Service Charge: 22% ($8,140)
- Gratuity: 20% (required, $7,400)
- Cake cutting fee: $500
- Corkage fee: $35/bottle (if bringing own wine)
- Late-night snack service: $2,500
- Vendor meal: $50/person for non-vendor staff

TOTAL: $55,540 (before tax)

PAYMENT SCHEDULE:
- Deposit: $20,000 (non-refundable) - Due March 15
- Second payment: $20,000 - Due May 15
- Final balance: Due day of event

CANCELLATION POLICY:
- 90+ days: Forfeit deposit
- 60-89 days: Forfeit 50% of total
- 30-59 days: Forfeit 75% of total
- Under 30 days: Forfeit 100% of total

GUEST COUNT:
Final count due 14 days before event. Billed for guaranteed count or actual attendance, whichever is higher.

OVERTIME:
Events exceeding contracted time: $500/hour

RED FLAGS:
- Double charges (service charge AND gratuity)
- Very high service charge (22%)
- Required gratuity
- Excessive cake cutting fee
- Harsh cancellation terms
- Charged for higher of guaranteed vs actual attendance
`;

// Mock OCR extracted text (what would come from OCR.space)
export const mockOCRResponse = {
  ParsedText: sampleConstructionContract,
  ErrorMessage: '',
  ErrorDetails: '',
  FileParseExitCode: 1,
  IsErroredOnProcessing: false,
  ProcessingTimeInMilliseconds: '1250'
};

// Mock AI analysis response (what would come from OpenAI)
export const mockAIAnalysisResponse = {
  documentType: 'Construction Contract',
  summary: 'This is a residential construction contract for a $450,000 single-family home build. The contract includes a payment schedule tied to construction milestones and several additional fees.',
  costBreakdown: {
    totalAmount: 450000,
    breakdown: [
      { item: 'Deposit (30%)', amount: 135000 },
      { item: 'Foundation Complete', amount: 90000 },
      { item: 'Framing Complete', amount: 90000 },
      { item: 'Rough-ins Complete', amount: 67500 },
      { item: 'Final Payment', amount: 67500 }
    ],
    additionalFees: [
      { item: 'Change Order Fee', amount: 150, unit: 'per hour' },
      { item: 'Rush Fee', amount: 20, unit: 'percent surcharge' },
      { item: 'Storage Fee', amount: 500, unit: 'per month' },
      { item: 'Document Processing Fee', amount: 250, unit: 'non-refundable' }
    ]
  },
  redFlags: [
    {
      flag: 'Excessive upfront deposit',
      severity: 'high',
      explanation: 'The 30% deposit ($135,000) is significantly higher than the industry standard of 10-15%. This puts you at greater financial risk if the contractor abandons the project or performs poorly.'
    },
    {
      flag: 'Vague termination clause with penalty',
      severity: 'high',
      explanation: 'The termination clause allows the contractor to retain all payments made plus an additional 25% penalty. This is unusually punitive and could cost you significantly if you need to exit the contract.'
    },
    {
      flag: 'Non-refundable processing fee',
      severity: 'medium',
      explanation: 'A $250 non-refundable document processing fee is unusual and appears to be an additional profit center rather than a legitimate administrative cost.'
    },
    {
      flag: 'No warranty information',
      severity: 'high',
      explanation: 'The contract does not specify warranty terms for materials or workmanship. Standard construction contracts should include at least a 1-year warranty.'
    },
    {
      flag: 'Missing dispute resolution clause',
      severity: 'medium',
      explanation: 'Without a clear dispute resolution process (mediation, arbitration), disagreements could lead to expensive litigation.'
    }
  ],
  riskScore: 78,
  recommendations: [
    'Negotiate the deposit down to 10-15% (industry standard)',
    'Request clear warranty terms (minimum 1 year)',
    'Add a dispute resolution clause (mediation before litigation)',
    'Clarify termination terms and reduce penalty',
    'Remove or reduce the processing fee'
  ]
};
