// app/api/razorpay/create-order/route.ts
// Create Razorpay order/subscription

import { NextResponse } from 'next/server'
import { createSubscription } from '@/lib/razorpay/subscriptions'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { customerId, planId } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create subscription
    const result = await createSubscription(planId, customerId)

    if (!result.success || !result.subscription) {
      return NextResponse.json({ error: result.error || 'Failed to create subscription' }, { status: 500 })
    }

    return NextResponse.json({
      subscriptionId: result.subscription.id,
      shortUrl: result.subscription.short_url,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    console.error('Error creating order:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}