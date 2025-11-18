import OpenAI from 'openai'
import {
  type AIAnalysisResult,
  type DocumentType,
  type ExtractedFields,
  type RedFlag,
  type Recommendation
} from '@/lib/types'
import {
  SUSPICIOUS_FEE_PATTERNS,
  PREDATORY_TERM_PATTERNS,
  VAGUE_CHARGE_PATTERNS,
  calculateRiskScore,
  getRiskLabel,
} from './config'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Main analysis function that orchestrates the AI analysis pipeline
 */
export async function analyzeDocument(rawText: string): Promise<AIAnalysisResult> {
  // Step 1: Classify document type
  const documentType = await classifyDocument(rawText)

  // Step 2: Extract key fields
  const extractedFields = await extractFields(rawText, documentType)

  // Step 3: Detect red flags (AI + rules-based)
  const aiRedFlags = await detectRedFlagsWithAI(rawText, documentType, extractedFields)
  const ruleBasedFlags = detectRedFlagsWithRules(rawText)

  // Merge and deduplicate flags
  const redFlags = mergeRedFlags(aiRedFlags, ruleBasedFlags)

  // Step 4: Calculate risk score
  const riskScore = calculateRiskScore(redFlags)
  const riskLabel = getRiskLabel(riskScore)

  // Step 5: Generate summary and recommendations
  const { summary, recommendations } = await generateSummaryAndAdvice(
    rawText,
    documentType,
    extractedFields,
    redFlags,
    riskScore
  )

  return {
    document_type: documentType,
    extracted_fields: extractedFields,
    red_flags: redFlags,
    risk_score: riskScore,
    risk_label: riskLabel,
    summary,
    recommendations,
  }
}

/**
 * Classify the document type using AI
 */
async function classifyDocument(text: string): Promise<DocumentType> {
  const prompt = `Analyze the following document text and classify it into ONE of these categories:
- INVOICE (bills, receipts, statements)
- ESTIMATE_DENTAL (dental treatment estimates or bills)
- ESTIMATE_AUTO (auto repair estimates or bills)
- ESTIMATE_HOME_REPAIR (home repair/contractor estimates)
- CONTRACT_SUBSCRIPTION (subscription services, memberships)
- LOAN_AGREEMENT (loans, credit agreements)
- OTHER (if it doesn't fit any above)

Document text:
"""
${text.substring(0, 3000)}
"""

Respond with ONLY the category name, nothing else.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 50,
    temperature: 0,
  })

  const result = response.choices[0]?.message?.content?.trim().toUpperCase() || 'OTHER'

  const validTypes: DocumentType[] = [
    'INVOICE', 'ESTIMATE_DENTAL', 'ESTIMATE_AUTO',
    'ESTIMATE_HOME_REPAIR', 'CONTRACT_SUBSCRIPTION',
    'LOAN_AGREEMENT', 'OTHER'
  ]

  return validTypes.includes(result as DocumentType)
    ? result as DocumentType
    : 'OTHER'
}

/**
 * Extract key fields from the document
 */
async function extractFields(
  text: string,
  documentType: DocumentType
): Promise<ExtractedFields> {
  const prompt = `Extract key information from this ${documentType} document. Return a JSON object with these fields:

{
  "consumer_name": "name of the customer/patient/client or null",
  "provider_name": "name of the company/provider or null",
  "dates": ["array of relevant dates found"],
  "total_cost": numeric total amount or null,
  "line_items": [
    {
      "description": "item description",
      "quantity": number or null,
      "unit_price": number or null,
      "line_total": number or null
    }
  ],
  "taxes_and_fees": [
    {"name": "fee name", "amount": number}
  ],
  "payment_terms": {
    "months": number of months or null,
    "apr": annual percentage rate or null,
    "interest_rate": interest rate or null
  } or null,
  "auto_renewal": true/false/null,
  "cancellation_terms": "cancellation policy text or null"
}

Document text:
"""
${text.substring(0, 4000)}
"""

Return ONLY valid JSON, no other text.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0,
    response_format: { type: 'json_object' },
  })

  try {
    const content = response.choices[0]?.message?.content || '{}'
    return JSON.parse(content) as ExtractedFields
  } catch {
    return {
      consumer_name: null,
      provider_name: null,
      dates: [],
      total_cost: null,
      line_items: [],
      taxes_and_fees: [],
      payment_terms: null,
      auto_renewal: null,
      cancellation_terms: null,
    }
  }
}

/**
 * Detect red flags using AI analysis
 */
async function detectRedFlagsWithAI(
  text: string,
  documentType: DocumentType,
  extractedFields: ExtractedFields
): Promise<Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[]> {
  const prompt = `You are a consumer protection expert. Analyze this ${documentType} document for potential red flags, hidden fees, and predatory terms.

Document text:
"""
${text.substring(0, 4000)}
"""

Extracted fields:
${JSON.stringify(extractedFields, null, 2)}

For each red flag found, return a JSON array with objects containing:
{
  "flag_type": "HIDDEN_FEE" | "PREDATORY_TERM" | "VAGUE_CHARGE" | "HIGH_TOTAL_COST" | "AUTO_RENEWAL" | "CANCELLATION_PENALTY",
  "severity": "HIGH" | "MEDIUM" | "LOW",
  "explanation": "Plain English explanation of why this is a concern",
  "snippet": "Exact text from document (if available)"
}

Look for:
- Unexplained fees or charges
- Automatic renewal clauses
- Early cancellation penalties
- Vague or unclear charges
- Unusually high totals or rates
- Hidden terms and conditions
- Binding arbitration clauses
- Rate increases after promotional period

Return ONLY a JSON array (can be empty if no issues found).`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    temperature: 0,
    response_format: { type: 'json_object' },
  })

  try {
    const content = response.choices[0]?.message?.content || '{"flags":[]}'
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : (parsed.flags || parsed.red_flags || [])
  } catch {
    return []
  }
}

/**
 * Detect red flags using rule-based pattern matching
 */
function detectRedFlagsWithRules(
  text: string
): Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[] {
  const flags: Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[] = []
  const lowerText = text.toLowerCase()

  // Check for suspicious fees
  for (const pattern of SUSPICIOUS_FEE_PATTERNS) {
    if (lowerText.includes(pattern)) {
      const snippet = findSnippet(text, pattern)
      flags.push({
        flag_type: 'HIDDEN_FEE',
        severity: 'MEDIUM',
        explanation: `Found "${pattern}" which may be an unnecessary or inflated fee. Consider asking the provider to justify or remove this charge.`,
        snippet,
      })
    }
  }

  // Check for predatory terms
  for (const pattern of PREDATORY_TERM_PATTERNS) {
    if (lowerText.includes(pattern)) {
      const snippet = findSnippet(text, pattern)
      let flagType: 'PREDATORY_TERM' | 'AUTO_RENEWAL' | 'CANCELLATION_PENALTY' = 'PREDATORY_TERM'

      if (pattern.includes('auto') || pattern.includes('renew')) {
        flagType = 'AUTO_RENEWAL'
      } else if (pattern.includes('cancel') || pattern.includes('termination')) {
        flagType = 'CANCELLATION_PENALTY'
      }

      flags.push({
        flag_type: flagType,
        severity: 'HIGH',
        explanation: `Found "${pattern}" which could lock you into unfavorable terms. Read this section carefully before signing.`,
        snippet,
      })
    }
  }

  // Check for vague charges
  for (const pattern of VAGUE_CHARGE_PATTERNS) {
    if (lowerText.includes(pattern)) {
      const snippet = findSnippet(text, pattern)
      flags.push({
        flag_type: 'VAGUE_CHARGE',
        severity: 'LOW',
        explanation: `Found "${pattern}" which is vague and should be clarified. Ask for an itemized breakdown.`,
        snippet,
      })
    }
  }

  return flags
}

/**
 * Find a text snippet around a pattern match
 */
function findSnippet(text: string, pattern: string): string {
  const lowerText = text.toLowerCase()
  const index = lowerText.indexOf(pattern)
  if (index === -1) return ''

  const start = Math.max(0, index - 50)
  const end = Math.min(text.length, index + pattern.length + 50)

  let snippet = text.substring(start, end).trim()
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}

/**
 * Merge and deduplicate red flags from AI and rules
 */
function mergeRedFlags(
  aiFlags: Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[],
  ruleFlags: Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[]
): Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[] {
  const merged = [...aiFlags]

  for (const ruleFlag of ruleFlags) {
    // Check if a similar flag already exists
    const exists = merged.some(
      f => f.flag_type === ruleFlag.flag_type &&
           f.snippet?.toLowerCase().includes(ruleFlag.snippet?.toLowerCase() || '')
    )

    if (!exists) {
      merged.push(ruleFlag)
    }
  }

  return merged
}

/**
 * Generate summary and actionable recommendations
 */
async function generateSummaryAndAdvice(
  text: string,
  documentType: DocumentType,
  extractedFields: ExtractedFields,
  redFlags: Omit<RedFlag, 'id' | 'analysis_id' | 'created_at'>[],
  riskScore: number
): Promise<{
  summary: string
  recommendations: Omit<Recommendation, 'id' | 'analysis_id' | 'created_at'>[]
}> {
  const flagsSummary = redFlags.map(f => `- ${f.explanation}`).join('\n')

  const prompt = `You are a consumer protection advisor. Based on the analysis below, provide:

1. A plain-English SUMMARY (2-3 sentences) explaining what this document is and the key points consumers should know.

2. 3-5 RECOMMENDATIONS with:
   - title: Short action title
   - body: Explanation of what to do
   - script_example: A ready-to-say script the consumer can use (or null)

Document type: ${documentType}
Risk score: ${riskScore}/100
Total cost: ${extractedFields.total_cost ? `$${extractedFields.total_cost}` : 'Not specified'}

Red flags found:
${flagsSummary || 'None'}

Return JSON:
{
  "summary": "Plain English summary...",
  "recommendations": [
    {
      "title": "Action title",
      "body": "What to do and why",
      "script_example": "What to say (or null)"
    }
  ]
}

Be specific, actionable, and consumer-friendly. Focus on protecting the consumer's interests.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  try {
    const content = response.choices[0]?.message?.content || '{}'
    const result = JSON.parse(content)
    return {
      summary: result.summary || 'Unable to generate summary.',
      recommendations: result.recommendations || [],
    }
  } catch {
    return {
      summary: 'Unable to generate summary. Please review the document manually.',
      recommendations: [
        {
          title: 'Review Manually',
          body: 'Our AI analysis encountered an issue. Please review the document carefully yourself.',
          script_example: null,
        }
      ],
    }
  }
}
