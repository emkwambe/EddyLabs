/**
 * OCR Pipeline - Extract text from documents (images and PDFs)
 *
 * This module provides text extraction functionality.
 * If OCR_API_KEY is not set, it falls back to a stub that returns
 * a message indicating the document should be re-uploaded as text.
 */

export async function extractTextFromDocument(
  fileUrl: string,
  mimeType: string
): Promise<string> {
  // Check if we have OCR API credentials
  const ocrApiKey = process.env.OCR_API_KEY
  const ocrApiUrl = process.env.OCR_API_URL || 'https://api.ocr.space/parse/image'

  // If it's already text-based (not requiring OCR), return early
  if (mimeType === 'text/plain') {
    // Fetch the text content directly
    const response = await fetch(fileUrl)
    return await response.text()
  }

  // For images and PDFs, use OCR
  if (!ocrApiKey) {
    // Return a stub message when OCR is not configured
    console.warn('OCR API key not configured. Using stub response.')
    return `[OCR NOT CONFIGURED]

This document appears to be an image or PDF that requires OCR processing.
Please configure OCR_API_KEY in your environment variables, or paste the
document content as text for analysis.

File URL: ${fileUrl}
MIME Type: ${mimeType}

To set up OCR:
1. Sign up for OCR.space API (free tier available)
2. Add OCR_API_KEY to your .env file
3. Re-upload the document`
  }

  try {
    // Determine if it's an image or PDF
    const isImage = mimeType.startsWith('image/')
    const isPdf = mimeType === 'application/pdf'

    if (!isImage && !isPdf) {
      throw new Error(`Unsupported file type for OCR: ${mimeType}`)
    }

    // Call OCR.space API
    const formData = new FormData()
    formData.append('url', fileUrl)
    formData.append('apikey', ocrApiKey)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')

    if (isPdf) {
      formData.append('isTable', 'true')
    }

    const response = await fetch(ocrApiUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`OCR API request failed: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.IsErroredOnProcessing) {
      throw new Error(`OCR processing error: ${result.ErrorMessage || 'Unknown error'}`)
    }

    // Extract text from all parsed results (handles multi-page PDFs)
    const extractedText = result.ParsedResults
      ?.map((r: { ParsedText: string }) => r.ParsedText)
      .join('\n\n')
      || ''

    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the document')
    }

    return extractedText
  } catch (error) {
    console.error('OCR extraction failed:', error)
    throw error
  }
}

/**
 * Validate file type for upload
 */
export function isValidFileType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ]
  return validTypes.includes(mimeType)
}

/**
 * Get file size limit in bytes (10MB)
 */
export function getFileSizeLimit(): number {
  return 10 * 1024 * 1024 // 10MB
}
