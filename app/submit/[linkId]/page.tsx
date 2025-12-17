// app/submit/[linkId]/page.tsx
// Updated with campaign tracking

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubmissionForm from '@/components/submission/submission-form'

export default async function SubmitPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ linkId: string }>
  searchParams: Promise<{ campaign_id?: string; email?: string }>
}) {
  const { linkId } = await params
  const { campaign_id, email } = await searchParams
  
  const supabase = await createClient()

  // Verify collection link exists
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('id, name, logo_url, brand_color, website_url')
    .eq('collection_link_id', linkId)
    .single()

  if (error || !workspace) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {workspace.logo_url && (
            <img 
              src={workspace.logo_url} 
              alt={workspace.name}
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Share Your Experience
          </h1>
          <p className="text-lg text-gray-600">
            Your feedback helps {workspace.name} improve
          </p>
          
          {campaign_id && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              📧 Thank you for responding to our email!
            </div>
          )}
        </div>

        {/* Form */}
        <SubmissionForm 
          linkId={linkId}
          workspaceName={workspace.name}
          brandColor={workspace.brand_color ?? undefined}
          campaignId={campaign_id}
          campaignEmail={email}
        />        

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by{' '}
          <a 
            href="https://trustedby.co" 
            className="text-blue-600 hover:text-blue-700 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            TrustedBy
          </a>
        </div>
      </div>
    </div>
  )
}