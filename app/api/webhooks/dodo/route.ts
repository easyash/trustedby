// app/api/webhooks/dodo/route.ts
// TEMPORARY: Webhook without signature verification (FOR TESTING ONLY!)
// This will help us confirm webhooks work, then we'll add security back

import { NextResponse } from 'next/server'
import {
  handleDodoSubscriptionActive,
  handleDodoSubscriptionRenewed,
  handleDodoSubscriptionUpdated,
  handleDodoSubscriptionOnHold,
  handleDodoSubscriptionFailed,
  handleDodoSubscriptionCancelled,
  handleDodoPaymentSucceeded,
  handleDodoPaymentFailed,
} from '@/lib/dodo/webhooks'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    
    console.log('📨 Dodo webhook received')
    console.log('⚠️  WARNING: Signature verification DISABLED (testing only)')

    const event = JSON.parse(body)
    const eventType = event.type

    console.log('📋 Webhook event:', eventType)
    console.log('📋 Event data:', JSON.stringify(event.data, null, 2))

    // Handle webhook events
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

      case 'subscription.cancelled':
        console.log('🎯 Handling subscription.cancelled')
        await handleDodoSubscriptionCancelled(event.data)
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}