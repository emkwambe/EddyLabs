/**
 * Mock analysis data for testing
 */

export const mockUser = {
  id: 'user-123-test',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockAnalysisCompleted = {
  id: 'analysis-123',
  user_id: mockUser.id,
  document_url: 'https://example.com/storage/document.pdf',
  original_filename: 'construction_contract.pdf',
  status: 'completed',
  document_type: 'Construction Contract',
  summary: 'This is a residential construction contract for a $450,000 single-family home build.',
  cost_breakdown: {
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
      { item: 'Storage Fee', amount: 500, unit: 'per month' }
    ]
  },
  red_flags: [
    {
      flag: 'Excessive upfront deposit',
      severity: 'high',
      explanation: 'The 30% deposit ($135,000) is significantly higher than the industry standard.'
    },
    {
      flag: 'No warranty information',
      severity: 'high',
      explanation: 'The contract does not specify warranty terms for materials or workmanship.'
    }
  ],
  risk_score: 78,
  recommendations: [
    'Negotiate the deposit down to 10-15%',
    'Request clear warranty terms',
    'Add a dispute resolution clause'
  ],
  created_at: '2024-02-15T10:30:00Z',
  updated_at: '2024-02-15T10:31:45Z',
  processing_time_ms: 105000
};

export const mockAnalysisProcessing = {
  id: 'analysis-456',
  user_id: mockUser.id,
  document_url: 'https://example.com/storage/document2.pdf',
  original_filename: 'service_agreement.pdf',
  status: 'processing',
  document_type: null,
  summary: null,
  cost_breakdown: null,
  red_flags: null,
  risk_score: null,
  recommendations: null,
  created_at: '2024-02-21T14:20:00Z',
  updated_at: '2024-02-21T14:20:30Z',
  processing_time_ms: null
};

export const mockAnalysisFailed = {
  id: 'analysis-789',
  user_id: mockUser.id,
  document_url: 'https://example.com/storage/document3.pdf',
  original_filename: 'corrupted_file.pdf',
  status: 'failed',
  error_message: 'OCR extraction failed: Unable to read document text',
  document_type: null,
  summary: null,
  cost_breakdown: null,
  red_flags: null,
  risk_score: null,
  recommendations: null,
  created_at: '2024-02-20T09:15:00Z',
  updated_at: '2024-02-20T09:15:45Z',
  processing_time_ms: 45000
};

export const mockAnalysisLowRisk = {
  id: 'analysis-101',
  user_id: mockUser.id,
  document_url: 'https://example.com/storage/good_contract.pdf',
  original_filename: 'standard_contract.pdf',
  status: 'completed',
  document_type: 'Service Agreement',
  summary: 'A standard service agreement with fair terms and clear conditions.',
  cost_breakdown: {
    totalAmount: 10000,
    breakdown: [
      { item: 'Setup Fee', amount: 2000 },
      { item: 'Monthly Service (12 months)', amount: 8000 }
    ],
    additionalFees: []
  },
  red_flags: [],
  risk_score: 25,
  recommendations: [
    'Contract looks fair overall',
    'Consider adding a performance clause'
  ],
  created_at: '2024-02-18T11:00:00Z',
  updated_at: '2024-02-18T11:01:20Z',
  processing_time_ms: 80000
};

export const mockAnalysisHighRisk = {
  id: 'analysis-202',
  user_id: mockUser.id,
  document_url: 'https://example.com/storage/risky_contract.pdf',
  original_filename: 'suspicious_lease.pdf',
  status: 'completed',
  document_type: 'Lease Agreement',
  summary: 'A commercial lease with multiple concerning clauses and unfavorable terms.',
  cost_breakdown: {
    totalAmount: 300000,
    breakdown: [
      { item: 'Security Deposit', amount: 15000 },
      { item: 'First Month Rent', amount: 5000 },
      { item: 'Last Month Rent', amount: 5000 },
      { item: 'Year 1 Total', amount: 60000 },
      { item: '5-Year Total', amount: 360000 }
    ],
    additionalFees: [
      { item: 'CAM Charges', amount: 800, unit: 'per month' },
      { item: 'Property Tax', amount: 400, unit: 'per month' },
      { item: 'Parking', amount: 400, unit: 'per month for 2 spaces' }
    ]
  },
  red_flags: [
    {
      flag: 'Excessive annual rent increases',
      severity: 'high',
      explanation: '8% annual increases are well above market rates and inflation.'
    },
    {
      flag: 'No early termination option',
      severity: 'high',
      explanation: 'Tenant is liable for all remaining rent if business fails or needs to relocate.'
    },
    {
      flag: 'High security deposit',
      severity: 'medium',
      explanation: 'Three months security deposit is higher than typical 1-2 months.'
    },
    {
      flag: 'Uncapped variable fees',
      severity: 'medium',
      explanation: 'CAM fees are variable with no maximum cap, creating budget uncertainty.'
    }
  ],
  risk_score: 85,
  recommendations: [
    'Negotiate rent escalation to 3-4% or tie to CPI',
    'Request early termination option with 6-month notice',
    'Reduce security deposit to 2 months',
    'Add cap to CAM fee increases',
    'Request right of first refusal for renewal'
  ],
  created_at: '2024-02-19T15:30:00Z',
  updated_at: '2024-02-19T15:32:10Z',
  processing_time_ms: 130000
};

export const mockAnalysesList = [
  mockAnalysisCompleted,
  mockAnalysisProcessing,
  mockAnalysisFailed,
  mockAnalysisLowRisk,
  mockAnalysisHighRisk
];

export const mockFeedback = {
  analysis_id: 'analysis-123',
  user_id: mockUser.id,
  rating: 5,
  comment: 'Very helpful! The red flags identified were exactly what I needed to see.',
  created_at: '2024-02-15T12:00:00Z'
};

export const mockFeedbackNegative = {
  analysis_id: 'analysis-789',
  user_id: mockUser.id,
  rating: 2,
  comment: 'Analysis failed and I had to re-upload the document.',
  created_at: '2024-02-20T10:00:00Z'
};
