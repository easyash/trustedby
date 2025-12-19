// app/api/payments/create-subscription/route.ts
// Unified subscription creation API that works with any provider

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscription } from '@/lib/payment/factory'
import type { Currency, BillingPeriod } from '@/types/subscription'

export async function POST(request: Request) {
  try {
    const { customerId, currency, billingPeriod, customerEmail, customerName } = await request.json()

    console.log('Creating subscription for:', { customerId, currency, billingPeriod })

    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== customerId) {
      console.error('Unauthorized: User mismatch', { userId: user?.id, customerId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create subscription using active provider
    const result = await createSubscription({
      customerId,
      currency: currency as Currency,
      billingPeriod: billingPeriod as BillingPeriod,
      customerEmail,
      customerName,
    })

    if (!result.success) {
      console.error('Failed to create subscription:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to create subscription' },
        { status: 500 }
      )
    }

    console.log('✅ Subscription created successfully:', result.subscriptionId)

    // Return different response based on provider
    // Razorpay: returns subscription_id + short_url (opens modal)
    // Dodo: returns payment_id + checkout_url (redirects to checkout)
    return NextResponse.json({
      subscriptionId: result.subscriptionId,
      shortUrl: result.shortUrl, // Razorpay only
      checkoutUrl: result.checkoutUrl, // Dodo only
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}