// app/(dashboard)/dashboard/ab-testing/page.tsx
// A/B testing dashboard for widget variants - TYPE SAFE

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces } from '@/lib/supabase/queries'
import VariantManager from '@/components/dashboard/variant-manager'
import type { WidgetSettings } from '@/types/widget'

export default async function ABTestingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customer = await getCurrentUser()
  const workspaces = await getUserWorkspaces(user.id)
  const workspace = workspaces[0]

  if (!workspace) {
    redirect('/dashboard')
  }

  // Fetch existing variants
  const { data: variantsData } = await supabase
    .from('widget_variants')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  // Transform variants to match expected type
  const variants = (variantsData || []).map((v) => ({
    id: v.id,
    variant_name: v.variant_name,
    settings: (v.settings as WidgetSettings) || {},
    is_active: v.is_active ?? false,
    views: v.views ?? 0,
    clicks: v.clicks ?? 0,
    conversion_rate: v.conversion_rate ?? 0,
    created_at: v.created_at || new Date().toISOString(),
    workspace_id: v.workspace_id,
  }))

  // Fetch default widget settings
  const { data: workspaceData } = await supabase
    .from('workspaces')
    .select('widget_settings')
    .eq('id', workspace.id)
    .single()

  const defaultSettings = (workspaceData?.widget_settings as WidgetSettings) || {
    theme: 'light',
    layout: 'grid',
    columns: 3,
    cardStyle: 'default',
    fontFamily: 'inter',
    fontSize: 'base',
    borderRadius: 'rounded',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#3b82f6',
    showRating: true,
    showAvatar: true,
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          A/B Testing
        </h1>
        <p className="text-gray-600">
          Test different widget layouts to see what converts better
        </p>
      </div>

      <VariantManager 
        workspaceId={workspace.id}
        variants={variants}
        defaultSettings={defaultSettings}
      />
    </div>
  )
}