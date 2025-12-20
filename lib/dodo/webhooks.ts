// lib/dodo/webhooks.ts
// DodoPayments webhook handlers - CORRECTED based on official documentation

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

/**
 * Verify Dodo webhook signature
 */
export function verifyDodoWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  )
}

/**
 * Handle subscription.active event
 * This fires when subscription is successfully activated
 */
export async function handleDodoSubscriptionActive(data: any) {
  const supabase = await createClient()
  
  const subscriptionId = data.subscription_id
  const customerEmail = data.customer?.email
  
  // Get customer_id from metadata (passed during checkout session creation)
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id

  console.log('✅ Subscription active:', { subscriptionId, customerEmail, customerId })

  if (!customerId) {
    console.error('❌ No customer_id in subscription metadata')
    return
  }

  // Activate subscription in database
  await supabase
    .from('customers')
    .update({
      subscription_status: 'active',
      subscription_id: subscriptionId,
      subscription_ends_at: null, // Clear any previous cancellation
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)

  console.log('✅ Subscription activated for customer:', customerId)
}

/**
 * Handle subscription.renewed event
 * This fires when subscription renews for next billing period
 */
export async function handleDodoSubscriptionRenewed(data: any) {
  const supabase = await createClient()
  
  const subscriptionId = data.subscription_id
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id

  console.log('🔄 Subscription renewed:', { subscriptionId, customerId })

  if (!customerId) {
    // If no customer_id in webhook, try to find by subscription_id
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .single()

    if (customer) {
      await supabase
        .from('customers')
        .update({
          subscription_status: 'active',
          subscription_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id)
      
      console.log('✅ Subscription renewed for customer:', customer.id)
    }
    return
  }

  // Ensure status is active and clear any cancellation
  await supabase
    .from('customers')
    .update({
      subscription_status: 'active',
      subscription_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)

  console.log('✅ Subscription renewed for customer:', customerId)
}

/**
 * Handle subscription.updated event
 * This fires on any subscription field change
 */
export async function handleDodoSubscriptionUpdated(data: any) {
  console.log('📝 Subscription updated:', data.subscription_id)
  // Handle specific updates if needed
  // For example: plan changes, quantity changes, etc.
}

/**
 * Handle subscription.on_hold event
 * This fires when subscription is put on hold due to failed payment
 */
export async function handleDodoSubscriptionOnHold(data: any) {
  const supabase = await createClient()
  
  const subscriptionId = data.subscription_id
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id

  console.log('⚠️ Subscription on hold:', { subscriptionId, customerId })

  if (!customerId) {
    // Try to find by subscription_id
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .single()

    if (customer) {
      await supabase
        .from('customers')
        .update({
          subscription_status: 'on_hold',
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id)
      
      console.log('⚠️ Subscription put on hold for customer:', customer.id)
      // TODO: Send email to customer to update payment method
    }
    return
  }

  await supabase
    .from('customers')
    .update({
      subscription_status: 'on_hold',
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)

  console.log('⚠️ Subscription put on hold for customer:', customerId)
  // TODO: Send email to customer to update payment method
}

/**
 * Handle subscription.failed event
 * This fires when subscription creation fails
 */
export async function handleDodoSubscriptionFailed(data: any) {
  const subscriptionId = data.subscription_id
  const customerEmail = data.customer?.email

  console.log('❌ Subscription failed:', { subscriptionId, customerEmail })
  // TODO: Send failure notification to customer
}

/**
 * Handle payment.succeeded event
 * This confirms successful payment
 */
export async function handleDodoPaymentSucceeded(data: any) {
  const subscriptionId = data.subscription_id
  const paymentId = data.payment_id
  const amount = data.amount
  const currency = data.currency

  console.log('💰 Payment succeeded:', { 
    subscriptionId, 
    paymentId,
    amount, 
    currency 
  })

  // Payment recorded, subscription should already be active via subscription.active event
  // You can store payment history here if needed
}

/**
 * Handle payment.failed event
 * This fires when a payment attempt fails
 */
export async function handleDodoPaymentFailed(data: any) {
  const subscriptionId = data.subscription_id
  const customerEmail = data.customer?.email
  const reason = data.failure_reason

  console.log('❌ Payment failed:', { subscriptionId, customerEmail, reason })
  
  // Note: subscription.on_hold event will also fire for failed renewals
  // TODO: Send payment failure notification to customer
}