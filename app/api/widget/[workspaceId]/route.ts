// app/api/widget/[workspaceId]/route.ts
// Enhanced with A/B testing support - NULL SAFE

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params

  try {
    const supabase = await createClient()
    
    // Check if A/B testing is enabled
    const { data: variants } = await supabase
      .from('widget_variants')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)

    let selectedVariant = null
    let widgetSettings = null

    if (variants && variants.length > 0) {
      // A/B testing enabled - select random variant
      selectedVariant = variants[Math.floor(Math.random() * variants.length)]
      widgetSettings = selectedVariant.settings

      // Increment view count with null safety
      const currentViews = selectedVariant.views ?? 0
      await supabase
        .from('widget_variants')
        .update({ views: currentViews + 1 })
        .eq('id', selectedVariant.id)
    } else {
      // No A/B testing - use default workspace settings
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('widget_settings')
        .eq('id', workspaceId)
        .single()

      widgetSettings = workspace?.widget_settings || {}
    }

    // Fetch approved testimonials
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('id, author_name, author_title, author_company, content, rating, media_type, author_avatar_url, created_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(12)

    if (error) throw error

    return NextResponse.json(
      { 
        testimonials: testimonials || [],
        settings: widgetSettings || {},
        variant_id: selectedVariant?.id || null,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      }
    )
  } catch (error) {
    console.error('Widget API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials', testimonials: [], settings: {} },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}