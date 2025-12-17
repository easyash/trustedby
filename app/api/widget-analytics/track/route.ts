// app/api/widget-analytics/track/route.ts
// Track widget events (views + clicks) with full CORS support

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Shared CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonWithCors(body: any, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS })
}

export async function OPTIONS() {
  // Preflight must respond with 204 + CORS headers
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    const { workspace_id, variant_id, event_type, session_id } = await request.json()

    if (!workspace_id || !event_type) {
      return jsonWithCors({ error: 'Missing required fields' }, 400)
    }

    const supabase = await createClient()

    // Store raw analytics event
    const { error: insertError } = await supabase
      .from('widget_analytics')
      .insert({
        workspace_id,
        variant_id: variant_id || null,
        event_type,
        session_id: session_id || null,
      })

    if (insertError) throw insertError

    //
    // --- VIEW EVENT ---
    //
    if (variant_id && event_type === 'view') {
      const { data: variant } = await supabase
        .from('widget_variants')
        .select('views')
        .eq('id', variant_id)
        .single()

      if (variant) {
        const currentViews = variant.views ?? 0

        await supabase
          .from('widget_variants')
          .update({
            views: currentViews + 1,
          })
          .eq('id', variant_id)
      }
    }

    //
    // --- CLICK EVENT ---
    //
    if (variant_id && event_type === 'click') {
      const { data: variant } = await supabase
        .from('widget_variants')
        .select('clicks, views')
        .eq('id', variant_id)
        .single()

      if (variant) {
        const currentClicks = variant.clicks ?? 0
        const currentViews = variant.views ?? 0
        const newClicks = currentClicks + 1

        const conversionRate =
          currentViews > 0
            ? ((newClicks / currentViews) * 100).toFixed(2)
            : '0.00'

        await supabase
          .from('widget_variants')
          .update({
            clicks: newClicks,
            conversion_rate: parseFloat(conversionRate),
          })
          .eq('id', variant_id)
      }
    }

    return jsonWithCors({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return jsonWithCors({ error: 'Failed to track event' }, 500)
  }
}
