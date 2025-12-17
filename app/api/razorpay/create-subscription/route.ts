// app/api/razorpay/create-subscription/route.ts
// Create Razorpay subscription - ENHANCED WITH LOGGING

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanId } from '@/lib/razorpay/plans'
import { createSubscription } from '@/lib/razorpay/subscriptions'
import type { Currency, BillingPeriod } from '@/types/subscription'

export async function POST(request: Request) {
  try {
    const { customerId, currency, billingPeriod } = await request.json()

    console.log('Creating subscription for:', { customerId, currency, billingPeriod })

    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== customerId) {
      console.error('Unauthorized: User mismatch', { userId: user?.id, customerId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get plan ID
    const planId = getPlanId(currency as Currency, billingPeriod as BillingPeriod)
    console.log('Plan ID:', planId)

    // Create subscription in Razorpay
    const result = await createSubscription(planId, customerId)

    if (!result.success || !result.subscription) {
      console.error('Failed to create subscription:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to create subscription' },
        { status: 500 }
      )
    }

    console.log('✅ Subscription created successfully:', result.subscription.id)

    return NextResponse.json({
      subscriptionId: result.subscription.id,
      shortUrl: result.subscription.short_url,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}