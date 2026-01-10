// lib/dodo/webhooks.ts
// Dodo Payments webhook handlers (RLS-safe, idempotent)

import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

/* ------------------------------------------------------------------ */
/* Signature verification                                              */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Subscription Events                                                 */
/* ------------------------------------------------------------------ */

export async function handleDodoSubscriptionActive(data: any) {
  const subscriptionId = data.subscription_id
  const customerId = data.metadata?.customer_id

  console.log('✅ Subscription active:', { subscriptionId, customerId })

  if (!customerId) {
    console.error('❌ Missing customer_id in metadata')
    return
  }

  const { data: updated, error } = await supabaseAdmin
    .from('customers')
    .update({
      subscription_status: 'active',
      subscription_id: subscriptionId,
      subscription_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)
    .select()
    .maybeSingle()

  if (error) {
    console.error('❌ DATABASE UPDATE ERROR:', error)
    return
  }

  if (!updated) {
    console.warn('⚠️  No customer updated (id not found?)', customerId)
    return
  }

  console.log('✅ Customer subscription activated:', updated.id)
}

export async function handleDodoSubscriptionRenewed(data: any) {
  const subscriptionId = data.subscription_id
  const customerId = data.metadata?.customer_id

  console.log('🔄 Subscription renewed:', { subscriptionId, customerId })

  if (!customerId) return

  const { error } = await supabaseAdmin
    .from('customers')
    .update({
      subscription_status: 'active',
      subscription_id: subscriptionId,
      subscription_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)

  if (error) {
    console.error('❌ DATABASE UPDATE ERROR:', error)
  }
}

export async function handleDodoSubscriptionUpdated(data: any) {
  console.log('📝 Subscription updated:', data.subscription_id)
}

export async function handleDodoSubscriptionOnHold(data: any) {
  const subscriptionId = data.subscription_id

  console.log('⚠️ Subscription on hold:', subscriptionId)

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .maybeSingle()

  if (!customer) {
    console.warn('⚠️ No customer found for subscription:', subscriptionId)
    return
  }

  const { error } = await supabaseAdmin
    .from('customers')
    .update({
      subscription_status: 'on_hold',
      updated_at: new Date().toISOString(),
    })
    .eq('id', customer.id)

  if (error) {
    console.error('❌ UPDATE ERROR:', error)
  }
}

export async function handleDodoSubscriptionCancelled(data: any) {

  const subscriptionId = data.subscription_id
  const customerId = data.metadata?.customer_id

  console.log('✅ Subscription active:', { subscriptionId, customerId })

  if (!customerId) {
    console.error('❌ Missing customer_id in metadata')
    return
  }

  const { data: updated, error } = await supabaseAdmin
    .from('customers')
    .update({
      subscription_status: 'cancelled',
      subscription_id: subscriptionId,
      subscription_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)
    .select()
    .maybeSingle()

  if (error) {
    console.error('❌ DATABASE UPDATE ERROR:', error)
    return
  }

  if (!updated) {
    console.warn('⚠️  No customer updated (id not found?)', customerId)
    return
  }

  console.log('✅ Customer subscription cancelled:', updated.id)  
  
}

export async function handleDodoSubscriptionFailed(data: any) {
  console.log('❌ Subscription failed:', data.subscription_id)
}

/* ------------------------------------------------------------------ */
/* Payment Events                                                      */
/* ------------------------------------------------------------------ */

export async function handleDodoPaymentSucceeded(data: any) {
  const paymentId = data.payment_id
  const customerId = data.metadata?.customer_id
  const customerEmail = data.customer?.email

  console.log('💰 Payment succeeded:', {
    paymentId,
    customerId,
    customerEmail,
  })

  let customer = null

  if (customerId) {
    const result = await supabaseAdmin
      .from('customers')
      .select('id, subscription_status')
      .eq('id', customerId)
      .maybeSingle()

    if (result.error) {
      console.error('❌ FETCH ERROR:', result.error)
      return
    }

    customer = result.data
  }

  // Fallback: email lookup
  if (!customer && customerEmail) {
    const result = await supabaseAdmin
      .from('customers')
      .select('id, subscription_status')
      .eq('email', customerEmail)
      .maybeSingle()

    if (result.error) {
      console.error('❌ EMAIL LOOKUP ERROR:', result.error)
      return
    }

    customer = result.data
  }

  if (!customer) {
    console.error('❌ Customer not found for payment:', paymentId)
    return
  }

  // Idempotency guard
  if (customer.subscription_status === 'active') {
    console.log('ℹ️ Subscription already active, skipping update')
    return
  }

  const { error } = await supabaseAdmin
    .from('customers')
    .update({
      subscription_status: 'active',
      subscription_id: paymentId,
      subscription_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customer.id)

  if (error) {
    console.error('❌ UPDATE ERROR:', error)
    return
  }

  console.log('✅ Subscription activated from payment:', customer.id)
}

export async function handleDodoPaymentFailed(data: any) {
  console.log('❌ Payment failed:', data.payment_id)
}
