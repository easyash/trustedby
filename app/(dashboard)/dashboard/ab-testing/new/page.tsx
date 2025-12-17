// app/(dashboard)/dashboard/ab-testing/new/page.tsx
// Create new A/B test variant

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces } from '@/lib/supabase/queries'
import CreateVariantForm from '@/components/dashboard/create-variant-form'

export default async function NewVariantPage() {
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

  // Get default widget settings
  const { data: workspaceData } = await supabase
    .from('workspaces')
    .select('widget_settings')
    .eq('id', workspace.id)
    .single()

  const defaultSettings = workspaceData?.widget_settings || {
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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create A/B Test Variant
        </h1>
        <p className="text-gray-600">
          Design a new widget variant to test different layouts and styles
        </p>
      </div>

      <CreateVariantForm 
        workspaceId={workspace.id}
        defaultSettings={defaultSettings}
      />
    </div>
  )
}