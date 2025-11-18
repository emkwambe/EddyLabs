import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/analyses/[id]/feedback - Submit feedback for an analysis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment } = body

    // Validate rating
    if (!rating || !['UP', 'DOWN'].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    // Check if analysis exists and belongs to user
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Check if user already submitted feedback
    const { data: existingFeedback } = await supabase
      .from('feedback')
      .select('id')
      .eq('analysis_id', id)
      .eq('user_id', user.id)
      .single()

    if (existingFeedback) {
      // Update existing feedback
      const { data: feedback, error: updateError } = await supabase
        .from('feedback')
        .update({ rating, comment: comment || null })
        .eq('id', existingFeedback.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
      }

      return NextResponse.json({ feedback })
    }

    // Create new feedback
    const { data: feedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        analysis_id: id,
        user_id: user.id,
        rating,
        comment: comment || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }

    return NextResponse.json({ feedback }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
