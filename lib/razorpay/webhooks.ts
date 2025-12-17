// lib/razorpay/webhooks.ts
// Razorpay webhook verification and handlers

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}

export async function handleSubscriptionActivated(data: any) {
  const supabase = await createClient()
  const customerId = data.payload.subscription.entity.notes.customer_id

  if (!customerId) {
    console.error('No customer_id in subscription notes')
    return
  }

  await supabase
    .from('customers')
    .update({
      subscription_status: 'active',
      subscription_id: data.payload.subscription.entity.id,
    })
    .eq('id', customerId)

  console.log('Subscription activated for customer:', customerId)
}

export async function handleSubscriptionCancelled(data: any) {
  const supabase = await createClient()
  const subscriptionId = data.payload.subscription.entity.id

  await supabase
    .from('customers')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('subscription_id', subscriptionId)

  console.log('Subscription cancelled:', subscriptionId)
}

export async function handlePaymentFailed(data: any) {
  const supabase = await createClient()
  const subscriptionId = data.payload.payment.entity.subscription_id

  // Send email notification to customer
  console.log('Payment failed for subscription:', subscriptionId)
  
  // Could update to a 'payment_failed' status
  // Or send notification email
}