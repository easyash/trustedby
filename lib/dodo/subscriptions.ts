// lib/dodo/subscriptions.ts
// DodoPayments subscription management - CORRECTED based on official docs

import { getDodoClient } from './client'
import { getDodoProductId } from './plans'
import { Currency, BillingPeriod } from '@/types/subscription'

export async function createDodoSubscription(
  currency: Currency,
  billingPeriod: BillingPeriod,
  customerId: string,
  customerEmail: string,
  customerName?: string
) {
  try {
    const dodo = getDodoClient()
    const productId = getDodoProductId(currency, billingPeriod)

    console.log('🔹 Creating Dodo payment link for:', { 
      productId, 
      customerEmail, 
      currency, 
      billingPeriod 
    })

    // Create payment link (this is the correct Dodo flow)
    const paymentLink = await dodo.createPaymentLink({
      product_id: productId,
      customer_email: customerEmail,
      customer_name: customerName,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=cancelled`,
      metadata: {
        customer_id: customerId,
        currency,
        billing_period: billingPeriod,
      },
    })

    console.log('✅ Dodo payment link created:', paymentLink.id)

    return {
      success: true,
      paymentLink,
      checkoutUrl: paymentLink.url, // The URL to redirect user to
      paymentId: paymentLink.id,
    }
  } catch (error) {
    console.error('❌ Error creating Dodo subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    }
  }
}

export async function cancelDodoSubscription(subscriptionId: string) {
  try {
    const dodo = getDodoClient()
    
    console.log('🔹 Cancelling Dodo subscription:', subscriptionId)
    
    const result = await dodo.cancelSubscription(subscriptionId, {
      cancel_at_period_end: true, // Cancel at end of billing period
    })
    
    console.log('✅ Dodo subscription cancelled:', result)
    
    return { 
      success: true, 
      subscription: result 
    }
  } catch (error) {
    console.error('❌ Error cancelling Dodo subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    }
  }
}

export async function getDodoSubscription(subscriptionId: string) {
  try {
    const dodo = getDodoClient()
    const subscription = await dodo.getSubscription(subscriptionId)
    return { success: true, subscription }
  } catch (error) {
    console.error('❌ Error fetching Dodo subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch subscription',
    }
  }
}

export async function getDodoCustomerPayments(customerEmail: string) {
  try {
    const dodo = getDodoClient()
    const payments = await dodo.listPayments({ customer_email: customerEmail })
    return { success: true, payments }
  } catch (error) {
    console.error('❌ Error fetching Dodo payments:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payments',
    }
  }
}