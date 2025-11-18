import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDocument } from '@/lib/ai/analyzeDocument'
import { extractTextFromDocument, isValidFileType, getFileSizeLimit } from '@/lib/ocr/extractText'

// GET /api/analyses - List all analyses for current user
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: analyses, error } = await supabase
      .from('analyses')
      .select(`
        *,
        red_flags (count),
        feedback (rating)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching analyses:', error)
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/analyses - Create a new analysis
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const sourceType = formData.get('source_type') as string
    const text = formData.get('text') as string | null
    const file = formData.get('file') as File | null
    const url = formData.get('url') as string | null

    // Validate input
    if (!sourceType || !['UPLOAD', 'TEXT', 'URL'].includes(sourceType)) {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 })
    }

    let rawText = ''
    let storagePath: string | null = null

    // Handle different source types
    if (sourceType === 'TEXT') {
      if (!text || text.trim().length === 0) {
        return NextResponse.json({ error: 'Text content is required' }, { status: 400 })
      }
      rawText = text
    } else if (sourceType === 'URL') {
      if (!url || !url.startsWith('http')) {
        return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 })
      }
      // Fetch content from URL
      try {
        const response = await fetch(url)
        rawText = await response.text()
      } catch {
        return NextResponse.json({ error: 'Failed to fetch URL content' }, { status: 400 })
      }
    } else if (sourceType === 'UPLOAD') {
      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 })
      }

      // Validate file type and size
      if (!isValidFileType(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Supported: JPG, PNG, PDF, TXT' },
          { status: 400 }
        )
      }

      if (file.size > getFileSizeLimit()) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB' },
          { status: 400 }
        )
      }

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
      }

      storagePath = fileName

      // Get public URL for OCR
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Extract text using OCR
      try {
        rawText = await extractTextFromDocument(urlData.publicUrl, file.type)
      } catch (ocrError) {
        console.error('OCR error:', ocrError)
        // Create analysis with error status
        const { data: analysis } = await supabase
          .from('analyses')
          .insert({
            user_id: user.id,
            status: 'FAILED',
            source_type: sourceType,
            storage_path: storagePath,
            error_message: 'Failed to extract text from document. Please try pasting the text manually.',
          })
          .select()
          .single()

        return NextResponse.json({ analysis }, { status: 201 })
      }
    }

    // Create initial analysis record
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        status: 'PROCESSING',
        source_type: sourceType,
        storage_path: storagePath,
        raw_text: rawText,
      })
      .select()
      .single()

    if (insertError || !analysis) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 })
    }

    // Perform AI analysis
    try {
      const result = await analyzeDocument(rawText)

      // Update analysis with results
      const { error: updateError } = await supabase
        .from('analyses')
        .update({
          status: 'COMPLETE',
          document_type: result.document_type,
          extracted_fields: result.extracted_fields,
          risk_score: result.risk_score,
          risk_label: result.risk_label,
          summary: result.summary,
        })
        .eq('id', analysis.id)

      if (updateError) {
        throw updateError
      }

      // Insert red flags
      if (result.red_flags.length > 0) {
        const flagsToInsert = result.red_flags.map(flag => ({
          analysis_id: analysis.id,
          ...flag,
        }))

        const { error: flagsError } = await supabase
          .from('red_flags')
          .insert(flagsToInsert)

        if (flagsError) {
          console.error('Error inserting red flags:', flagsError)
        }
      }

      // Insert recommendations
      if (result.recommendations.length > 0) {
        const recsToInsert = result.recommendations.map(rec => ({
          analysis_id: analysis.id,
          ...rec,
        }))

        const { error: recsError } = await supabase
          .from('recommendations')
          .insert(recsToInsert)

        if (recsError) {
          console.error('Error inserting recommendations:', recsError)
        }
      }

      return NextResponse.json({ analysis: { ...analysis, ...result } }, { status: 201 })
    } catch (aiError) {
      console.error('AI analysis error:', aiError)

      // Update analysis with error status
      await supabase
        .from('analyses')
        .update({
          status: 'FAILED',
          error_message: 'AI analysis failed. Please try again.',
        })
        .eq('id', analysis.id)

      return NextResponse.json(
        { analysis: { ...analysis, status: 'FAILED' } },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
