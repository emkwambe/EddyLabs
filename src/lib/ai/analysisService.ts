/**
 * AI Analysis Service
 * Simplified service that uses OpenAI directly for document analysis
 */

import OpenAI from 'openai';

export interface AnalysisServiceResult {
  documentType: string;
  summary: string;
  costBreakdown: {
    totalAmount: number;
    breakdown: Array<{
      item: string;
      amount: number;
    }>;
    additionalFees?: Array<{
      item: string;
      amount: number;
      unit?: string;
    }>;
  };
  redFlags: Array<{
    flag: string;
    severity: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  riskScore: number;
  recommendations: string[];
}

function getOpenAI(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'test-key',
  });
}

/**
 * Analyzes a document text and returns structured analysis results
 * @param documentText - The extracted text from the document
 * @returns Analysis results including risk score, red flags, and recommendations
 * @throws Error if document text is empty or invalid
 */
export async function analyzeDocument(documentText: string): Promise<AnalysisServiceResult> {
  // Validate input
  if (!documentText || documentText.trim().length === 0) {
    throw new Error('Document text cannot be empty');
  }

  const openai = getOpenAI();

  const prompt = `Analyze the following contract/document and provide a detailed risk assessment.

Document Text:
${documentText}

Please provide your analysis in the following JSON format:
{
  "documentType": "string (e.g., 'Construction Contract', 'Service Agreement', etc.)",
  "summary": "string (1-2 sentence summary)",
  "costBreakdown": {
    "totalAmount": number,
    "breakdown": [{"item": "string", "amount": number}],
    "additionalFees": [{"item": "string", "amount": number, "unit": "string"}]
  },
  "redFlags": [
    {
      "flag": "string (brief title)",
      "severity": "high | medium | low",
      "explanation": "string (detailed explanation)"
    }
  ],
  "riskScore": number (0-100),
  "recommendations": ["string"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a legal and financial document analysis expert. Analyze contracts and documents for red flags, risks, and provide actionable recommendations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI analysis');
  }

  // Parse the JSON response
  const result = JSON.parse(content) as AnalysisServiceResult;

  return result;
}
