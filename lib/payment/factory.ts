// lib/payment/factory.ts
// Payment provider factory - abstraction layer for both providers

import { Currency, BillingPeriod } from '@/types/subscription'
import { getActiveProvider } from '@/types/payment'

// Razorpay imports
import { createSubscription as createRazorpaySubscription } from '@/lib/razorpay/subscriptions'
import { getPlanId as getRazorpayPlanId } from '@/lib/razorpay/plans'

// Dodo imports
import { createDodoSubscription } from '@/lib/dodo/subscriptions'

export interface CreateSubscriptionParams {
  currency: Currency
  billingPeriod: BillingPeriod
  customerId: string
  customerEmail: string
  customerName?: string
}

export interface CreateSubscriptionResult {
  success: boolean
  subscriptionId?: string
  checkoutUrl?: string
  shortUrl?: string
  error?: string
}

export interface CancelSubscriptionResult {
  success: boolean
  endsAt?: string
  message?: string
  error?: string
}

// Factory function to create subscription with active provider
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  const provider = getActiveProvider()

  if (provider === 'razorpay') {
    return createRazorpaySubscriptionFlow(params)
  } else {
    return createDodoSubscriptionFlow(params)
  }
}

// Razorpay subscription flow
async function createRazorpaySubscriptionFlow(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  try {
    const planId = getRazorpayPlanId(params.currency, params.billingPeriod)
    const result = await createRazorpaySubscription(planId, params.customerId)

    if (!result.success || !result.subscription) {
      return {
        success: false,
        error: result.error || 'Failed to create Razorpay subscription',
      }
    }

    return {
      success: true,
      subscriptionId: result.subscription.id,
      shortUrl: result.subscription.short_url,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Razorpay error',
    }
  }
}

// Dodo subscription flow
async function createDodoSubscriptionFlow(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  try {
    const result = await createDodoSubscription(
      params.currency,
      params.billingPeriod,
      params.customerId,
      params.customerEmail,
      params.customerName
    )

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to create Dodo subscription',
      }
    }

    return {
      success: true,
      subscriptionId: result.paymentId,
      checkoutUrl: result.checkoutUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Dodo error',
    }
  }
}

// Get provider display name
export function getProviderDisplayName(): string {
  const provider = getActiveProvider()
  return provider === 'razorpay' ? 'Razorpay' : 'DodoPayments'
}

// Get provider-specific field name for subscription_id
export function getSubscriptionIdField(): string {
  const provider = getActiveProvider()
  return provider === 'razorpay' ? 'razorpay_subscription_id' : 'subscription_id'
}

// Get provider-specific field name for customer_id
export function getCustomerIdField(): string {
  const provider = getActiveProvider()
  return provider === 'razorpay' ? 'razorpay_customer_id' : 'lemon_squeezy_customer_id'
}