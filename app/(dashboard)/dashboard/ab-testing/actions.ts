// app/(dashboard)/dashboard/ab-testing/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WidgetSettings } from '@/types/widget'

export async function createVariant(
  workspaceId: string,
  variantName: string,
  settings: WidgetSettings
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify workspace ownership
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('customer_id')
      .eq('id', workspaceId)
      .single()

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!workspace || workspace.customer_id !== customer?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Create variant
    const { data: variant, error } = await supabase
      .from('widget_variants')
      .insert({
        workspace_id: workspaceId,
        variant_name: variantName,
        settings: settings,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/ab-testing')
    return { success: true, variant }
  } catch (error) {
    console.error('Create variant error:', error)
    return { success: false, error: 'Failed to create variant' }
  }
}

export async function toggleVariant(variantId: string, isActive: boolean) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update variant
    const { error } = await supabase
      .from('widget_variants')
      .update({ is_active: isActive })
      .eq('id', variantId)

    if (error) throw error

    revalidatePath('/dashboard/ab-testing')
    return { success: true }
  } catch (error) {
    console.error('Toggle variant error:', error)
    return { success: false, error: 'Failed to update variant' }
  }
}

export async function deleteVariant(variantId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete variant
    const { error } = await supabase
      .from('widget_variants')
      .delete()
      .eq('id', variantId)

    if (error) throw error

    revalidatePath('/dashboard/ab-testing')
    return { success: true }
  } catch (error) {
    console.error('Delete variant error:', error)
    return { success: false, error: 'Failed to delete variant' }
  }
}

export async function getVariantStats(workspaceId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Fetch variants with stats
    const { data: variants, error } = await supabase
      .from('widget_variants')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('conversion_rate', { ascending: false })

    if (error) throw error

    return { success: true, variants }
  } catch (error) {
    console.error('Get variant stats error:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}