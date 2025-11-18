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
