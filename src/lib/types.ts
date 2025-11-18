// Document Types
export type DocumentType =
  | 'INVOICE'
  | 'ESTIMATE_DENTAL'
  | 'ESTIMATE_AUTO'
  | 'ESTIMATE_HOME_REPAIR'
  | 'CONTRACT_SUBSCRIPTION'
  | 'LOAN_AGREEMENT'
  | 'OTHER'

export type SourceType = 'UPLOAD' | 'TEXT' | 'URL'

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED'

export type RiskLabel = 'SAFE' | 'MILD_CONCERN' | 'HIGH_CONCERN'

export type FlagType = 'HIDDEN_FEE' | 'PREDATORY_TERM' | 'VAGUE_CHARGE' | 'HIGH_TOTAL_COST' | 'AUTO_RENEWAL' | 'CANCELLATION_PENALTY'

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

// Database Models
export interface User {
  id: string
  email: string
  name: string | null
  country: string | null
  preferred_currency: string
  created_at: string
}

export interface Analysis {
  id: string
  user_id: string
  status: AnalysisStatus
  document_type: DocumentType | null
  source_type: SourceType
  storage_path: string | null
  raw_text: string | null
  risk_score: number | null
  risk_label: RiskLabel | null
  summary: string | null
  created_at: string
  updated_at: string
}

export interface RedFlag {
  id: string
  analysis_id: string
  flag_type: FlagType
  severity: Severity
  explanation: string
  snippet: string | null
  created_at: string
}

export interface Recommendation {
  id: string
  analysis_id: string
  title: string
  body: string
  script_example: string | null
  created_at: string
}

export interface Feedback {
  id: string
  analysis_id: string
  user_id: string
  rating: 'UP' | 'DOWN'
  comment: string | null
  created_at: string
}

// API Response Types
export interface AnalysisWithDetails extends Analysis {
  red_flags: RedFlag[]
  recommendations: Recommendation[]
  feedback: Feedback[]
}

// AI Analysis Types
export interface ExtractedFields {
  consumer_name: string | null
  provider_name: string | null
  dates: string[]
  total_cost: number | null
  line_items: LineItem[]
  taxes_and_fees: TaxOrFee[]
  payment_terms: PaymentTerms | null
  auto_renewal: boolean | null
  cancellation_terms: string | null
}

export interface LineItem {
  description: string
  quantity: number | null
  unit_price: number | null
  line_total: number | null
}

export interface TaxOrFee {
  name: string
  amount: number
}

export interface PaymentTerms {
  months: number | null
  apr: number | null
  interest_rate: number | null
}

export interface AIAnalysisResult {
  document_type: DocumentType
  extracted_fields: ExtractedFields
  red_flags: Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[]
  risk_score: number
  risk_label: RiskLabel
  summary: string
  recommendations: Omit<Recommendation, 'id' | 'analysis_id' | 'created_at'>[]
}
