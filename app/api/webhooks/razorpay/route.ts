// app/api/webhooks/razorpay/route.ts
// Razorpay webhook endpoint - ENHANCED WITH LOGGING

import { NextResponse } from 'next/server'
import { verifyWebhookSignature, handleSubscriptionActivated, handleSubscriptionCancelled, handlePaymentFailed } from '@/lib/razorpay/webhooks'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    console.log('📨 Webhook received')

    if (!signature) {
      console.error('❌ No signature in webhook')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('✅ Webhook signature verified')

    const data = JSON.parse(body)
    const event = data.event

    console.log('📋 Webhook event:', event)

    // Handle different webhook events
    switch (event) {
      case 'subscription.activated':
        console.log('🎯 Handling subscription.activated')
        await handleSubscriptionActivated(data)
        break

      case 'subscription.charged':
        // First payment for subscription
        console.log('🎯 Handling subscription.charged (treating as activation)')
        await handleSubscriptionActivated(data)
        break

      case 'subscription.cancelled':
        console.log('🎯 Handling subscription.cancelled')
        await handleSubscriptionCancelled(data)
        break

      case 'subscription.completed':
        console.log('🎯 Handling subscription.completed (treating as cancellation)')
        await handleSubscriptionCancelled(data)
        break

      case 'subscription.paused':
        console.log('⏸️  Subscription paused (not implemented)')
        break

      case 'subscription.halted':
        console.log('🛑 Subscription halted due to payment failure')
        await handlePaymentFailed(data)
        break

      case 'payment.failed':
        console.log('💳 Payment failed')
        await handlePaymentFailed(data)
        break

      default:
        console.log('ℹ️  Unhandled webhook event:', event)
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true, event })
  } catch (error) {
    console.error('❌ Razorpay webhook error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}