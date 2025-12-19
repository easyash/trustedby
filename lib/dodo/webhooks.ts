// lib/dodo/webhooks.ts
// DodoPayments webhook verification and handlers - CORRECTED based on official docs

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

/**
 * Verify Dodo webhook signature
 * Dodo uses HMAC-SHA256 with webhook secret
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
 * Handle subscription.created event
 * Fired when a subscription is first created
 */
export async function handleDodoSubscriptionCreated(data: any) {
  const supabase = await createClient()
  
  const customerEmail = data.customer?.email
  const subscriptionId = data.id
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id

  console.log('📋 Subscription created:', { subscriptionId, customerEmail, customerId })

  if (!customerId) {
    console.error('❌ No customer_id in subscription metadata')
    return
  }

  // Update customer record with subscription ID
  await supabase
    .from('customers')
    .update({
      subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)

  console.log('✅ Subscription ID saved for customer:', customerId)
}

/**
 * Handle subscription.activated event
 * Fired when first payment succeeds and subscription becomes active
 */
export async function handleDodoSubscriptionActivated(data: any) {
  const supabase = await createClient()
  
  const customerEmail = data.customer?.email
  const subscriptionId = data.id
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id

  console.log('💳 Subscription activated:', { subscriptionId, customerEmail, customerId })

  if (!customerId) {
    console.error('❌ No customer_id in subscription metadata')
    return
  }

  // Activate subscription
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
 * Fired when a recurring payment succeeds
 */
export async function handleDodoSubscriptionRenewed(data: any) {
  const supabase = await createClient()
  
  const subscriptionId = data.id
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id

  console.log('🔄 Subscription renewed:', { subscriptionId, customerId })

  if (!customerId) {
    console.error('❌ No customer_id in subscription metadata')
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
 * Handle subscription.cancelled event
 * Fired when subscription is cancelled
 */
export async function handleDodoSubscriptionCancelled(data: any) {
  const supabase = await createClient()
  
  const subscriptionId = data.id
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id
  const endsAt = data.current_period_end // Timestamp when access ends

  console.log('🛑 Subscription cancelled:', { subscriptionId, customerId, endsAt })

  if (!customerId) {
    console.error('❌ No customer_id in subscription metadata')
    return
  }

  // Calculate subscription end date
  const subscriptionEndsAt = endsAt 
    ? new Date(endsAt * 1000).toISOString() // Dodo sends Unix timestamp
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Fallback: 30 days

  await supabase
    .from('customers')
    .update({
      subscription_status: 'cancelled',
      subscription_ends_at: subscriptionEndsAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)

  console.log('✅ Subscription marked as cancelled, ends at:', subscriptionEndsAt)
}

/**
 * Handle subscription.expired event
 * Fired when subscription period ends after cancellation
 */
export async function handleDodoSubscriptionExpired(data: any) {
  const supabase = await createClient()
  
  const subscriptionId = data.id
  const metadata = data.metadata || {}
  const customerId = metadata.customer_id

  console.log('⏰ Subscription expired:', { subscriptionId, customerId })

  if (!customerId) {
    console.error('❌ No customer_id in subscription metadata')
    return
  }

  // Subscription has fully expired
  await supabase
    .from('customers')
    .update({
      subscription_status: 'cancelled',
      subscription_ends_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)

  console.log('✅ Subscription expired for customer:', customerId)
}

/**
 * Handle payment.failed event
 * Fired when a payment attempt fails
 */
export async function handleDodoPaymentFailed(data: any) {
  const subscriptionId = data.subscription_id
  const customerEmail = data.customer?.email

  console.log('❌ Payment failed:', { subscriptionId, customerEmail })
  
  // Could send email notification to customer
  // Could update status to indicate payment issue
  // For now, just log it
}

/**
 * Handle payment.succeeded event
 * Fired when a payment succeeds (first or recurring)
 */
export async function handleDodoPaymentSucceeded(data: any) {
  const subscriptionId = data.subscription_id
  const customerEmail = data.customer?.email
  const amount = data.amount
  const currency = data.currency

  console.log('💰 Payment succeeded:', { 
    subscriptionId, 
    customerEmail, 
    amount, 
    currency 
  })

  // Payment recorded, subscription should already be active
  // Could send receipt email here
}