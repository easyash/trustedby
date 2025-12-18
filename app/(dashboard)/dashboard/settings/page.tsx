// app/(dashboard)/dashboard/settings/page.tsx
// UPDATED: Added missing type imports

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces } from '@/lib/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, AlertTriangle } from 'lucide-react'
import { WorkspaceSettingsForm, ProfileSettingsForm } from '@/components/dashboard/settings-forms'
import UpgradeButton from '@/components/dashboard/upgrade-button'
import LogoUploader from '@/components/dashboard/logo-uploader'
import ScrollToSubscription from '@/components/scroll-to-subscription'
import { checkTrialStatus, checkSubscriptionStatus } from '@/lib/utils/trial'
import type { Currency, BillingPeriod } from '@/types/subscription' // ADDED: Import types

export default async function SettingsPage() {
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

  // Check trial status (existing)
  const trialStatus = checkTrialStatus(
    customer?.subscription_status || null,
    customer?.trial_ends_at || null
  )

  // Check full subscription status (includes cancellation)
  const subscriptionStatus = checkSubscriptionStatus(
    customer?.subscription_status || null,
    customer?.trial_ends_at || null,
    customer?.subscription_ends_at || null
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Scroll handler */}
      <ScrollToSubscription />
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-gray-600" />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your workspace and account settings
        </p>
      </div>

      {/* Logo Uploader */}
      <LogoUploader 
        workspaceId={workspace.id} 
        currentLogoUrl={workspace.logo_url || undefined}
      />

      {/* Workspace Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>
            Customize your workspace name and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <WorkspaceSettingsForm workspace={workspace} />
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your personal account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileSettingsForm customer={customer} />
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card id="subscription">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your billing and subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subscription Status Card */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            subscriptionStatus.isCancelled 
              ? 'bg-orange-50 border-orange-200' 
              : subscriptionStatus.isExpired
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div>
              <p className={`font-semibold ${
                subscriptionStatus.isCancelled 
                  ? 'text-orange-900' 
                  : subscriptionStatus.isExpired
                  ? 'text-red-900'
                  : 'text-blue-900'
              }`}>
                {customer?.subscription_status === 'trial' && '⏱️ Trial Plan'}
                {customer?.subscription_status === 'active' && '✓ Pro Plan'}
                {customer?.subscription_status === 'lifetime' && '⭐ Lifetime Access'}
                {customer?.subscription_status === 'cancelled' && (
                  <>
                    {subscriptionStatus.isActive ? '⚠️ Cancelled (Active Until End Date)' : '❌ Subscription Ended'}
                  </>
                )}
              </p>
              <p className={`text-sm mt-1 ${
                subscriptionStatus.isCancelled 
                  ? 'text-orange-700' 
                  : subscriptionStatus.isExpired
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {customer?.subscription_status === 'trial' && customer.trial_ends_at && (
                  <>
                    {trialStatus.isExpired 
                      ? `Trial expired on ${new Date(customer.trial_ends_at).toLocaleDateString()}`
                      : `Trial ends ${new Date(customer.trial_ends_at).toLocaleDateString()} (${trialStatus.daysRemaining} days)`
                    }
                  </>
                )}
                {customer?.subscription_status === 'active' && (
                  <>
                    {customer.currency === 'USD' ? '₹999' : '₹999'}/month • 
                    {customer.billing_period === 'monthly' ? 'Monthly' : 'Annual'} billing
                  </>
                )}
                {customer?.subscription_status === 'lifetime' && 'Paid once, access forever'}
                {customer?.subscription_status === 'cancelled' && subscriptionStatus.expiresAt && (
                  <>
                    {subscriptionStatus.isActive 
                      ? `Access ends ${subscriptionStatus.expiresAt.toLocaleDateString()} (${subscriptionStatus.daysRemaining} days remaining)`
                      : `Ended on ${subscriptionStatus.expiresAt.toLocaleDateString()}`
                    }
                  </>
                )}
              </p>
            </div>
            
            {/* Manage Billing Button */}
            {(customer?.subscription_status === 'active' || customer?.subscription_status === 'cancelled') && (
              <Link href="/dashboard/settings/billing">
                <Button variant="outline">
                  Manage Billing
                </Button>
              </Link>
            )}
          </div>

          {/* Cancelled Subscription - Grace Period Warning */}
          {subscriptionStatus.isCancelled && subscriptionStatus.isActive && (
            <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900 mb-2">
                    Your subscription is cancelled
                  </p>
                  <p className="text-sm text-orange-800 mb-3">
                    You have <strong>{subscriptionStatus.daysRemaining} days</strong> of access remaining. 
                    Resubscribe with your previous plan ({customer?.currency} {customer?.billing_period}).
                  </p>
                  <UpgradeButton
                    customerId={customer?.id ?? ""}
                    customerEmail={customer?.email ?? ""}
                    customerName={customer?.name ?? ""}
                    currentCurrency={(customer?.currency as Currency) || 'INR'}
                    currentBillingPeriod={(customer?.billing_period as BillingPeriod) || 'monthly'}
                    showSelector={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Subscription - Expired */}
          {subscriptionStatus.isCancelled && !subscriptionStatus.isActive && (
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-2">
                    Your subscription has ended
                  </p>
                  <p className="text-sm text-red-800 mb-4">
                    Your subscription ended on {subscriptionStatus.expiresAt?.toLocaleDateString()}. 
                    Choose your plan to restore access.
                  </p>
                  <UpgradeButton
                    customerId={customer?.id ?? ""}
                    customerEmail={customer?.email ?? ""}
                    customerName={customer?.name ?? ""}
                    currentCurrency={(customer?.currency as Currency) || 'INR'}
                    currentBillingPeriod={(customer?.billing_period as BillingPeriod) || 'monthly'}
                    showSelector={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Prompt for Trial Users */}
          {customer?.subscription_status === 'trial' && (
            <div className={`p-4 rounded-lg border ${trialStatus.isExpired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-sm mb-4 ${trialStatus.isExpired ? 'text-red-800' : 'text-green-800'}`}>
                {trialStatus.isExpired ? (
                  <>
                    <strong>⚠️ Trial Expired:</strong> Upgrade now to restore full access
                  </>
                ) : (
                  <>
                    <strong>🎉 Limited Time Offer:</strong> Choose your plan below
                  </>
                )}
              </p>
              <UpgradeButton
                customerId={customer?.id ?? ""}
                customerEmail={customer?.email ?? ""}
                customerName={customer?.name ?? ""}
                showSelector={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Delete Workspace (Coming Soon)
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            This will permanently delete your workspace and all testimonials
          </p>
        </CardContent>
      </Card>
    </div>
  )
}