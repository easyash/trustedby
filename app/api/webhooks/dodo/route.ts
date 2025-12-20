// app/api/webhooks/dodo/route.ts
// DodoPayments webhook endpoint - CORRECTED based on official documentation

import { NextResponse } from 'next/server'
import {
  verifyDodoWebhookSignature,
  handleDodoSubscriptionActive,
  handleDodoSubscriptionRenewed,
  handleDodoSubscriptionUpdated,
  handleDodoSubscriptionOnHold,
  handleDodoSubscriptionFailed,
  handleDodoPaymentSucceeded,
  handleDodoPaymentFailed,
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

    const event = JSON.parse(body)
    const eventType = event.type

    console.log('📋 Webhook event:', eventType)
    console.log('📋 Event data:', JSON.stringify(event.data, null, 2))

    // Handle webhook events based on official Dodo documentation
    switch (eventType) {
      case 'subscription.active':
        console.log('🎯 Handling subscription.active')
        await handleDodoSubscriptionActive(event.data)
        break

      case 'subscription.renewed':
        console.log('🎯 Handling subscription.renewed')
        await handleDodoSubscriptionRenewed(event.data)
        break

      case 'subscription.updated':
        console.log('🎯 Handling subscription.updated')
        await handleDodoSubscriptionUpdated(event.data)
        break

      case 'subscription.on_hold':
        console.log('🎯 Handling subscription.on_hold')
        await handleDodoSubscriptionOnHold(event.data)
        break

      case 'subscription.failed':
        console.log('🎯 Handling subscription.failed')
        await handleDodoSubscriptionFailed(event.data)
        break

      case 'payment.succeeded':
        console.log('🎯 Handling payment.succeeded')
        await handleDodoPaymentSucceeded(event.data)
        break

      case 'payment.failed':
        console.log('🎯 Handling payment.failed')
        await handleDodoPaymentFailed(event.data)
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