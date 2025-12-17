// app/(dashboard)/dashboard/settings/billing/page.tsx
// Complete billing management page with cancellation status

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { checkSubscriptionStatus } from '@/lib/utils/trial'
import BillingActions from '@/components/dashboard/billing-actions'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customer = await getCurrentUser()

  if (!customer) {
    redirect('/dashboard')
  }

  const subscriptionStatus = checkSubscriptionStatus(
    customer.subscription_status,
    customer.trial_ends_at,
    customer.subscription_ends_at
  )

  // Mock billing history (in production, fetch from Razorpay)
  // Create dates outside of component render to avoid impure function calls
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const billingHistory = [
    {
      id: '1',
      amount: 12.00,
      date: now.toISOString(),
      status: 'paid',
    },
    {
      id: '2',
      amount: 12.00,
      date: thirtyDaysAgo.toISOString(),
      status: 'paid',
    },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-gray-600" />
          Billing & Subscription
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your subscription details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Plan Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-lg">
                  {subscriptionStatus.isTrial && '⏱️ Free Trial'}
                  {subscriptionStatus.isPaid && !subscriptionStatus.isCancelled && '✓ Pro Plan'}
                  {subscriptionStatus.isLifetime && '⭐ Lifetime Access'}
                  {subscriptionStatus.isCancelled && '⚠️ Cancelled Plan'}
                  {subscriptionStatus.isExpired && '❌ Expired'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {subscriptionStatus.isTrial && subscriptionStatus.expiresAt && (
                    <>
                      {subscriptionStatus.isExpired 
                        ? `Trial expired on ${subscriptionStatus.expiresAt.toLocaleDateString()}`
                        : `Trial ends on ${subscriptionStatus.expiresAt.toLocaleDateString()} (${subscriptionStatus.daysRemaining} days)`
                      }
                    </>
                  )}
                  {subscriptionStatus.isPaid && !subscriptionStatus.isCancelled && (
                    <>
                      {customer.currency === 'USD' ? '$12' : '₹999'}/month • 
                      {customer.billing_period === 'monthly' ? 'Monthly' : 'Annual'} billing • 
                      Currency: {customer.currency || 'INR'}
                    </>
                  )}
                  {subscriptionStatus.isLifetime && 'One-time payment • Access forever'}
                  {subscriptionStatus.isCancelled && subscriptionStatus.expiresAt && (
                    <>
                      {subscriptionStatus.isActive 
                        ? `Access until ${subscriptionStatus.expiresAt.toLocaleDateString()} (${subscriptionStatus.daysRemaining} days)`
                        : `Access ended on ${subscriptionStatus.expiresAt.toLocaleDateString()}`
                      }
                    </>
                  )}
                </p>
              </div>
              {(subscriptionStatus.isTrial || subscriptionStatus.isExpired) && (
                <Link href="/dashboard/settings">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Upgrade to Pro
                  </button>
                </Link>
              )}
            </div>

            {/* Cancelled Subscription Warning */}
            {subscriptionStatus.isCancelled && subscriptionStatus.isActive && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 mb-1">
                      Subscription Cancelled
                    </p>
                    <p className="text-sm text-orange-800">
                      Your subscription will end on {subscriptionStatus.expiresAt?.toLocaleDateString()}.
                      You have {subscriptionStatus.daysRemaining} days of access remaining.
                      Resubscribe anytime to continue using TrustedBy after this date.
                    </p>
                    <Link href="/dashboard/settings#subscription">
                      <button className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700">
                        Resubscribe Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Ended - No Access */}
            {subscriptionStatus.isCancelled && !subscriptionStatus.isActive && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Subscription Ended
                    </p>
                    <p className="text-sm text-red-800 mb-3">
                      Your subscription ended on {subscriptionStatus.expiresAt?.toLocaleDateString()}.
                      Resubscribe to restore full access to testimonials, moderation, campaigns, and all Pro features.
                    </p>
                    <Link href="/dashboard/settings#subscription">
                      <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                        Resubscribe to Restore Access
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Trial Info */}
            {subscriptionStatus.isTrial && !subscriptionStatus.isExpired && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Trial Benefits:</strong> Enjoy unlimited testimonials, campaigns, and all Pro features until {subscriptionStatus.expiresAt?.toLocaleDateString()}.
                </p>
              </div>
            )}

            {/* Expired Trial Warning */}
            {subscriptionStatus.isExpired && subscriptionStatus.isTrial && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900 font-medium mb-2">
                  Your trial has expired
                </p>
                <p className="text-sm text-red-800">
                  Upgrade to Pro to continue using TrustedBy and access all features including testimonial moderation, campaigns, and more.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {(subscriptionStatus.isPaid || subscriptionStatus.isCancelled) && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/2025</p>
                </div>
              </div>
              <BillingActions
                action="update-payment"
                subscriptionId={customer.subscription_id || ''}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Payment methods are managed securely through Razorpay
            </p>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {(subscriptionStatus.isPaid || subscriptionStatus.isCancelled) && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.length > 0 ? (
                billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <BillingActions
                      action="download"
                      invoiceId={invoice.id}
                      invoiceData={{
                        amount: invoice.amount,
                        date: invoice.date,
                        status: invoice.status,
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No billing history available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription - Only show for active paid subscriptions */}
      {subscriptionStatus.isPaid && !subscriptionStatus.isCancelled && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Cancel Subscription</CardTitle>
            <CardDescription>
              End your Pro subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              If you cancel, you&apos;ll lose access to Pro features at the end of your current billing period. Your data will be preserved.
            </p>
            <BillingActions action="cancel" />
          </CardContent>
        </Card>
      )}

      {/* Back Link */}
      <div className="flex justify-center">
        <Link href="/dashboard/settings#subscription">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            ← Back to Settings
          </button>
        </Link>
      </div>
    </div>
  )
}