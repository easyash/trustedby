// app/(dashboard)/dashboard/testimonials/moderation/page.tsx
// MINIMAL CHANGES: Adds cancellation warnings while preserving ALL existing logic

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces } from '@/lib/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Lock } from 'lucide-react'
import ModerationActions from '@/components/dashboard/moderation-actions'
import UpgradePrompt from '@/components/dashboard/upgrade-prompt'
import { checkTrialStatus, checkSubscriptionStatus } from '@/lib/utils/trial' // NEW: Import both

export default async function ModerationPage() {
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

  // EXISTING: Keep original trial check (used by existing UI)
  const trialStatus = checkTrialStatus(
    customer?.subscription_status || null,
    customer?.trial_ends_at || null
  )

  // NEW: Add enhanced check for cancellation support
  const subscriptionStatus = checkSubscriptionStatus(
    customer?.subscription_status || null,
    customer?.trial_ends_at || null,
    customer?.subscription_ends_at || null  // NEW: Pass subscription end date
  )

  // Fetch pending testimonials (existing logic)
  const { data: pendingTestimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('workspace_id', workspace.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const testimonials = pendingTestimonials || []

  return (
    <div className="space-y-6">
      {/* Header - UNCHANGED */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-8 h-8 text-yellow-600" />
          Moderation Queue
        </h1>
        <p className="text-gray-600 mt-2">
          Review and approve testimonials before they go live
        </p>
      </div>

      {/* NEW: Cancelled subscription warnings (ADDITIVE - doesn't affect existing flow) */}
      {subscriptionStatus.isCancelled && subscriptionStatus.isActive && subscriptionStatus.daysRemaining !== null && subscriptionStatus.daysRemaining <= 7 && (
        <UpgradePrompt
          message={`⚠️ Your subscription ends in ${subscriptionStatus.daysRemaining} days. Resubscribe to continue moderating testimonials.`}
          daysRemaining={subscriptionStatus.daysRemaining}
          variant="urgent"
          showDismiss={false}
        />
      )}

      {subscriptionStatus.isCancelled && !subscriptionStatus.isActive && (
        <UpgradePrompt
          message="Your subscription has ended. Resubscribe to restore access to moderation and all Pro features."
          variant="expired"
          showDismiss={false}
        />
      )}

      {/* EXISTING: Trial expiration warning - UNCHANGED */}
      {trialStatus.isExpired && !subscriptionStatus.isCancelled && (
        <UpgradePrompt
          message="Your trial has expired. Upgrade to continue moderating testimonials."
          variant="expired"
          showDismiss={false}
        />
      )}

      {/* EXISTING: Trial ending soon warning - UNCHANGED */}
      {!trialStatus.isPro && trialStatus.daysRemaining <= 3 && trialStatus.daysRemaining > 0 && (
        <UpgradePrompt
          message={`Your trial ends ${trialStatus.daysRemaining === 1 ? 'tomorrow' : `in ${trialStatus.daysRemaining} days`}. Upgrade now to avoid interruption.`}
          daysRemaining={trialStatus.daysRemaining}
          variant={trialStatus.daysRemaining === 1 ? 'urgent' : 'warning'}
          showDismiss={true}
        />
      )}

      {/* Stats - EXISTING with minor enhancement */}
      <Card>
        <CardHeader>
          <CardTitle>
            {testimonials.length} Testimonial{testimonials.length !== 1 ? 's' : ''} Pending
          </CardTitle>
          {/* UPDATED: Use subscriptionStatus for more accurate disabled state */}
          {!subscriptionStatus.canModerate && (
            <CardDescription className="text-red-600 font-medium">
              <Lock className="w-4 h-4 inline mr-1" />
              Moderation disabled - {subscriptionStatus.upgradeMessage}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Pending Testimonials - EXISTING logic preserved */}
      {testimonials.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Clear!
            </h3>
            <p className="text-gray-600">
              No testimonials awaiting review. Share your collection link to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className={`border-l-4 ${!subscriptionStatus.canModerate ? 'border-red-500 opacity-75' : 'border-yellow-500'}`}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    {testimonial.author_name}
                    {testimonial.author_title && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        • {testimonial.author_title}
                      </span>
                    )}
                  </span>
                  {!subscriptionStatus.canModerate && (
                    <Lock className="w-5 h-5 text-red-500" />
                  )}
                </CardTitle>
                {testimonial.author_company && (
                  <CardDescription>{testimonial.author_company}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {/* Rating - UNCHANGED */}
                {testimonial.rating != null && (
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))} 
                  </div>
                )}

                {/* Content - UNCHANGED */}
                <p className="text-gray-800 italic mb-4">&quot;{testimonial.content}&quot;</p>

                {/* Avatar Preview - UNCHANGED */}
                {testimonial.author_avatar_url && (
                  <div className="mb-4">
                    <img 
                      src={testimonial.author_avatar_url} 
                      alt={testimonial.author_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Metadata - UNCHANGED */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>
                    Submitted {testimonial.created_at 
                      ? new Date(testimonial.created_at).toLocaleDateString()
                      : 'Recently'
                    }
                  </span>
                  {testimonial.author_email && (
                    <span>• {testimonial.author_email}</span>
                  )}
                  {testimonial.media_type && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                      🎥 Video
                    </span>
                  )}
                </div>
                
                {/* EXISTING: Action Buttons - Props unchanged */}
                <ModerationActions 
                  testimonialId={testimonial.id}
                  isDisabled={!subscriptionStatus.canModerate}  // UPDATED: Use new status
                  authorEmail={testimonial.author_email || undefined}
                />

                {/* UPDATED: Disabled Message with better context */}
                {!subscriptionStatus.canModerate && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <Lock className="w-4 h-4 inline mr-1" />
                      {subscriptionStatus.upgradeMessage || 'Moderation is locked.'}
                      {' '}
                      <a href="/dashboard/settings" className="underline font-medium">
                        {subscriptionStatus.isCancelled ? 'Resubscribe' : 'Upgrade to Pro'}
                      </a>
                      {' '}to approve or reject testimonials.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}