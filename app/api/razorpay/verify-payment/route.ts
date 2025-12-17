// app/api/razorpay/verify-payment/route.ts
// NEW FILE - Verify Razorpay payment and activate subscription immediately

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = body

    console.log('🔍 Verifying payment:', {
      payment_id: razorpay_payment_id,
      subscription_id: razorpay_subscription_id,
    })

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Invalid payment signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('✅ Payment signature verified')

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('❌ No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 Authenticated user:', user.id)

    // Fetch subscription details from Razorpay to get customer_id from notes
    const razorpayAuth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString('base64')

    const subscriptionResponse = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${razorpay_subscription_id}`,
      {
        headers: {
          Authorization: `Basic ${razorpayAuth}`,
        },
      }
    )

    if (!subscriptionResponse.ok) {
      console.error('❌ Failed to fetch subscription from Razorpay')
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
    }

    const subscription = await subscriptionResponse.json()
    const customerId = subscription.notes?.customer_id

    console.log('📋 Subscription details:', {
      subscription_id: subscription.id,
      customer_id: customerId,
      status: subscription.status,
    })

    // Verify the customer ID matches the authenticated user
    if (!customerId || customerId !== user.id) {
      console.error('❌ Customer ID mismatch:', { 
        expected: user.id, 
        received: customerId 
      })
      return NextResponse.json({ error: 'Unauthorized - Customer mismatch' }, { status: 401 })
    }

    // Update customer subscription status in database
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        subscription_status: 'active',
        subscription_id: razorpay_subscription_id,
        subscription_ends_at: null, // Clear any previous cancellation end date
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating customer:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    console.log('✅ Subscription activated successfully for customer:', user.id)

    return NextResponse.json({ 
      success: true,
      message: 'Payment verified and subscription activated',
      subscription_id: razorpay_subscription_id,
    })
  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return NextResponse.json(
      { 
        error: 'Payment verification failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}