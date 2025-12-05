/**
 * Red Flag Detection Configuration
 *
 * This file contains patterns and keywords used for rule-based
 * red flag detection alongside the AI analysis.
 */

export const SUSPICIOUS_FEE_PATTERNS = [
  // Generic suspicious fees
  'processing fee',
  'facility fee',
  'shop supplies',
  'miscellaneous fee',
  'document fee',
  'administrative fee',
  'convenience fee',
  'service charge',
  'handling fee',
  'paper fee',
  'environmental fee',
  'disposal fee',

  // Dental-specific
  'infection control fee',
  'sterilization fee',
  'ppe fee',
  'covid fee',
  'biohazard fee',

  // Auto-specific
  'shop supplies fee',
  'hazardous waste fee',
  'diagnostic fee',
  'bench fee',

  // Home repair
  'mobilization fee',
  'trip charge',
  'permit pulling fee',
  'cleanup fee',
]

export const PREDATORY_TERM_PATTERNS = [
  // Auto-renewal traps
  'automatically renew',
  'auto-renewal',
  'auto renew',
  'will be renewed',
  'continuous enrollment',

  // Cancellation penalties
  'early termination fee',
  'cancellation fee',
  'early cancellation',
  'penalty for canceling',
  'buyout amount',

  // Hidden rate increases
  'introductory rate',
  'teaser rate',
  'promotional rate',
  'rate will increase',
  'subject to change',
  'may adjust',

  // Binding arbitration
  'binding arbitration',
  'waive right to sue',
  'class action waiver',

  // Vague language
  'at our discretion',
  'we reserve the right',
  'without notice',
  'as we see fit',
]

export const VAGUE_CHARGE_PATTERNS = [
  'other charges',
  'additional fees may apply',
  'plus applicable fees',
  'miscellaneous',
  'various fees',
  'sundry',
  'incidentals',
  'etc.',
]

export const HIGH_INTEREST_THRESHOLD = 20 // APR percentage
export const HIGH_CANCELLATION_FEE_THRESHOLD = 200 // USD

export const DOCUMENT_TYPE_KEYWORDS = {
  INVOICE: [
    'invoice', 'bill', 'receipt', 'statement', 'amount due',
    'payment due', 'total due', 'balance due'
  ],
  ESTIMATE_DENTAL: [
    'dental', 'dentist', 'tooth', 'teeth', 'crown', 'filling',
    'extraction', 'root canal', 'cleaning', 'periodontal', 'orthodontic'
  ],
  ESTIMATE_AUTO: [
    'auto', 'vehicle', 'car', 'repair', 'mechanic', 'brake',
    'transmission', 'oil change', 'tire', 'engine', 'diagnostic'
  ],
  ESTIMATE_HOME_REPAIR: [
    'home repair', 'contractor', 'renovation', 'remodel', 'plumbing',
    'electrical', 'hvac', 'roofing', 'flooring', 'painting'
  ],
  CONTRACT_SUBSCRIPTION: [
    'subscription', 'membership', 'monthly', 'annual', 'recurring',
    'auto-renew', 'billing cycle', 'service agreement'
  ],
  LOAN_AGREEMENT: [
    'loan', 'apr', 'interest rate', 'principal', 'promissory note',
    'borrower', 'lender', 'repayment', 'amortization'
  ],
}

export const RISK_SCORE_WEIGHTS = {
  HIGH: 25,
  MEDIUM: 15,
  LOW: 5,
}

export function calculateRiskScore(flags: { severity: string }[]): number {
  let score = 0

  for (const flag of flags) {
    score += RISK_SCORE_WEIGHTS[flag.severity as keyof typeof RISK_SCORE_WEIGHTS] || 0
  }

  // Cap at 100
  return Math.min(score, 100)
}

export function getRiskLabel(score: number): 'SAFE' | 'MILD_CONCERN' | 'HIGH_CONCERN' {
  if (score <= 20) return 'SAFE'
  if (score <= 50) return 'MILD_CONCERN'
  return 'HIGH_CONCERN'
}

// Fee Analysis
export interface FeeAnalysis {
  totalFees: number
  feePercentage: number
  feeCount: number
  industryStandardMin: number
  industryStandardMax: number
  isSuspicious: boolean
  estimatedOvercharge: number
  reasoning: string
}

export function analyzeFees(
  lineItems: Array<{ description: string; line_total?: number; amount?: number }>,
  totalCost: number
): FeeAnalysis {
  const feeKeywords = SUSPICIOUS_FEE_PATTERNS.map(p => p.toLowerCase())

  // Find all fee line items
  const fees = lineItems.filter(item => {
    const desc = item.description.toLowerCase()
    return feeKeywords.some(keyword => desc.includes(keyword))
  })

  const totalFees = fees.reduce((sum, fee) => {
    return sum + (fee.line_total || fee.amount || 0)
  }, 0)

  const feePercentage = totalCost > 0 ? (totalFees / totalCost) * 100 : 0

  // Industry standards: 3-5% as a single consolidated fee
  const industryStandardMin = totalCost * 0.03
  const industryStandardMax = totalCost * 0.05

  const isSuspicious = feePercentage > 5 || fees.length > 1
  const estimatedOvercharge = Math.max(0, totalFees - industryStandardMax)

  let reasoning = ''
  if (fees.length > 1) {
    reasoning = `Found ${fees.length} separate fees totaling $${totalFees.toFixed(2)} (${feePercentage.toFixed(1)}%). Industry standard is a single consolidated fee at 3-5%. Splitting into multiple line items obscures the total impact.`
  } else if (feePercentage > 5) {
    reasoning = `Total fees are ${feePercentage.toFixed(1)}% of the estimate, exceeding the industry standard of 3-5%.`
  } else if (totalFees > 0) {
    reasoning = `Fees total $${totalFees.toFixed(2)} (${feePercentage.toFixed(1)}%), within industry standards.`
  }

  return {
    totalFees,
    feePercentage,
    feeCount: fees.length,
    industryStandardMin,
    industryStandardMax,
    isSuspicious,
    estimatedOvercharge,
    reasoning,
  }
}

// Double-Billing Detection
export interface DoubleBillingCheck {
  hasDoubleBilling: boolean
  diagnosticFee: number | null
  laborHours: number | null
  explanation: string
  potentialSavings: number
}

export function checkDoubleBilling(
  lineItems: Array<{ description: string; quantity?: number; line_total?: number }>,
): DoubleBillingCheck {
  const diagnosticItem = lineItems.find(item =>
    item.description.toLowerCase().includes('diagnostic')
  )

  const laborItems = lineItems.filter(item => {
    const desc = item.description.toLowerCase()
    return desc.includes('labor') && !desc.includes('diagnostic')
  })

  if (!diagnosticItem || laborItems.length === 0) {
    return {
      hasDoubleBilling: false,
      diagnosticFee: null,
      laborHours: null,
      explanation: '',
      potentialSavings: 0,
    }
  }

  const diagnosticFee = diagnosticItem.line_total || 0
  const totalLaborHours = laborItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  // Diagnostic typically takes 0.5-1.5 hours
  // If there's both diagnostic fee AND labor, it's likely double-billing
  const hasDoubleBilling = diagnosticFee > 0 && totalLaborHours > 0

  let explanation = ''
  let potentialSavings = 0

  if (hasDoubleBilling) {
    potentialSavings = diagnosticFee
    explanation = `You're being charged $${diagnosticFee.toFixed(2)} for diagnostics PLUS ${totalLaborHours} hours of labor. Industry standard: diagnostic fee is waived when repairs are approved, OR it's included in labor hours. This appears to be double-billing for overlapping work.`
  }

  return {
    hasDoubleBilling,
    diagnosticFee,
    laborHours: totalLaborHours,
    explanation,
    potentialSavings,
  }
}
