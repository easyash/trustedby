// app/api/webhooks/dodo/route.ts
// DodoPayments webhook endpoint - CORRECTED based on official docs

import { NextResponse } from 'next/server'
import {
  verifyDodoWebhookSignature,
  handleDodoSubscriptionCreated,
  handleDodoSubscriptionActivated,
  handleDodoSubscriptionRenewed,
  handleDodoSubscriptionCancelled,
  handleDodoSubscriptionExpired,
  handleDodoPaymentFailed,
  handleDodoPaymentSucceeded,
} from '@/lib/dodo/webhooks'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-dodo-signature')

    console.log('📨 Dodo webhook received')

    if (!signature) {
      console.error('❌ No signature in webhook')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ DODO_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const isValid = verifyDodoWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('✅ Webhook signature verified')

    const data = JSON.parse(body)
    const eventType = data.type

    console.log('📋 Webhook event:', eventType)

    // Handle different webhook events
    // Event types from Dodo docs: https://docs.dodopayments.com/webhooks
    switch (eventType) {
      case 'subscription.created':
        console.log('🎯 Handling subscription.created')
        await handleDodoSubscriptionCreated(data)
        break

      case 'subscription.activated':
        console.log('🎯 Handling subscription.activated')
        await handleDodoSubscriptionActivated(data)
        break

      case 'subscription.renewed':
        console.log('🎯 Handling subscription.renewed')
        await handleDodoSubscriptionRenewed(data)
        break

      case 'subscription.cancelled':
        console.log('🎯 Handling subscription.cancelled')
        await handleDodoSubscriptionCancelled(data)
        break

      case 'subscription.expired':
        console.log('🎯 Handling subscription.expired')
        await handleDodoSubscriptionExpired(data)
        break

      case 'payment.failed':
        console.log('🎯 Handling payment.failed')
        await handleDodoPaymentFailed(data)
        break

      case 'payment.succeeded':
        console.log('🎯 Handling payment.succeeded')
        await handleDodoPaymentSucceeded(data)
        break

      default:
        console.log('ℹ️  Unhandled webhook event:', eventType)
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true, event: eventType })
  } catch (error) {
    console.error('❌ Dodo webhook error:', error)
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}