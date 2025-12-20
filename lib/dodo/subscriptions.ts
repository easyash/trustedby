// lib/dodo/subscriptions.ts
// DodoPayments subscription management - CORRECTED to use Checkout Sessions

import { getDodoClient } from './client'
import { getDodoProductId } from './plans'
import { Currency, BillingPeriod } from '@/types/subscription'

/**
 * Create a Dodo checkout session for subscription
 * This is the official Dodo API method for subscriptions
 */
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

    console.log('🔹 Creating Dodo checkout session for:', { 
      productId, 
      customerEmail, 
      currency, 
      billingPeriod 
    })

    // Create checkout session (official Dodo API)
    const session = await dodo.createCheckoutSession({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: customerEmail,
        name: customerName,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=success`,
      // Optional: Add trial period if needed
      // subscription_data: {
      //   trial_period_days: 0,
      // },
      // Pass metadata for webhook handling
      metadata: {
        customer_id: customerId,
        currency,
        billing_period: billingPeriod,
      },
    })

    console.log('✅ Dodo checkout session created:', {
      session_id: session.session_id,
      checkout_url: session.checkout_url
    })

    return {
      success: true,
      session,
      checkoutUrl: session.checkout_url, // URL to redirect user to
      sessionId: session.session_id,
    }
  } catch (error) {
    console.error('❌ Error creating Dodo subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    }
  }
}

/**
 * Cancel Dodo subscription
 * Cancels at end of current billing period
 */
export async function cancelDodoSubscription(subscriptionId: string) {
  try {
    const dodo = getDodoClient()
    
    console.log('🔹 Cancelling Dodo subscription:', subscriptionId)
    
    const result = await dodo.cancelSubscription(subscriptionId)
    
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

/**
 * Get Dodo subscription details
 */
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

/**
 * Get customer payments from Dodo
 */
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