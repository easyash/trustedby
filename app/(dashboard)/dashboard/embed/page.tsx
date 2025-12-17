// app/(dashboard)/dashboard/embed/page.tsx
// Widget embed code page - FIXED

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces } from '@/lib/supabase/queries'
import EmbedCodeGenerator from '@/components/dashboard/embed-code-generator'
import WidgetCustomizer from '@/components/dashboard/widget-customizer'
import type { WidgetSettings } from '@/types/widget'

export default async function EmbedPage() {
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

  // Fetch workspace with widget_settings from the workspaces table
  const { data: workspaceData, error } = await supabase
    .from('workspaces')
    .select('widget_settings')
    .eq('id', workspace.id)
    .single()

  // Default settings if none exist or if there's an error
  const initialSettings: WidgetSettings = (workspaceData?.widget_settings as WidgetSettings) || {
    layout: 'grid',
    columns: 3,
    theme: 'light',
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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Embed Your Widget
        </h1>
        <p className="text-gray-600">
          Copy and paste this code snippet into your website to display your testimonials
        </p>
      </div>

      <div className="space-y-6">
        <EmbedCodeGenerator workspace={workspace} />
        <WidgetCustomizer 
          workspaceId={workspace.id} 
          initialSettings={initialSettings} 
        />
      </div>
    </div>
  )
}