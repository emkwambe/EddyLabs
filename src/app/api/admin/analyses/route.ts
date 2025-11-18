import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/analyses - List all analyses (admin only)
export async function GET() {
  try {
    const supabase = await createServiceClient()

    // Note: In production, add proper admin role checking
    // For MVP, this is protected by route middleware

    const { data: analyses, error } = await supabase
      .from('analyses')
      .select(`
        *,
        users (email, name),
        red_flags (*),
        recommendations (*),
        feedback (*)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching analyses:', error)
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }

    // Get feedback statistics
    const { data: feedbackStats } = await supabase
      .from('feedback')
      .select('rating')

    const stats = {
      total: feedbackStats?.length || 0,
      helpful: feedbackStats?.filter(f => f.rating === 'UP').length || 0,
      notHelpful: feedbackStats?.filter(f => f.rating === 'DOWN').length || 0,
    }

    return NextResponse.json({ analyses, stats })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
