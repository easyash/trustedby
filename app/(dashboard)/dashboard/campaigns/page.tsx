// app/(dashboard)/dashboard/campaigns/page.tsx
// Email campaigns management - NULL SAFE

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces } from '@/lib/supabase/queries'
import CampaignList from '@/components/dashboard/campaign-list'
import CreateCampaignButton from '@/components/dashboard/create-campaign-button'

export default async function CampaignsPage() {
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

  // Fetch campaigns
  const { data: campaignsData } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  // Map to component-friendly format with null safety
  const campaigns = (campaignsData || []).map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    subject: campaign.subject,
    body: campaign.body,
    recipients: campaign.recipients,
    sent_count: campaign.sent_count ?? 0,
    response_count: campaign.response_count ?? 0,
    status: campaign.status ?? 'draft',
    created_at: campaign.created_at ?? new Date().toISOString(),
    sent_at: campaign.sent_at,
  }))

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Campaigns
          </h1>
          <p className="text-gray-600">
            Request testimonials via email and track responses
          </p>
        </div>
        <CreateCampaignButton workspaceId={workspace.id} />
      </div>

      <CampaignList 
        campaigns={campaigns} 
        workspaceId={workspace.id}
        collectionLink={`${process.env.NEXT_PUBLIC_APP_URL}/submit/${workspace.collection_link_id}`}
      />
    </div>
  )
}