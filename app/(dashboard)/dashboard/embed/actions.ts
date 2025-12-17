// app/(dashboard)/dashboard/embed/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WidgetSettings } from '@/types/widget'

export async function updateWidgetSettings(
  workspaceId: string,
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

    // Convert settings to plain object for JSONB storage
    const settingsJson = JSON.parse(JSON.stringify(settings))

    // Update widget_settings JSONB column in workspaces table
    const { error: updateError } = await supabase
      .from('workspaces')
      .update({ 
        widget_settings: settingsJson,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workspaceId)

    if (updateError) throw updateError

    revalidatePath('/dashboard/embed')
    revalidatePath('/api/widget/[workspaceId]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Update widget settings error:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}