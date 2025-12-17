// lib/razorpay/plans.ts
// Razorpay plan IDs configuration

import { Currency, BillingPeriod } from '@/types/subscription'

// Store your Razorpay Plan IDs here
// You need to create these plans in Razorpay Dashboard
export const RAZORPAY_PLAN_IDS: Record<Currency, Record<BillingPeriod, string>> = {
  USD: {
    monthly: process.env.RAZORPAY_PLAN_USD_MONTHLY || 'plan_xxxxx',
    annual: process.env.RAZORPAY_PLAN_USD_ANNUAL || 'plan_xxxxx',
  },
  INR: {
    monthly: process.env.RAZORPAY_PLAN_INR_MONTHLY || 'plan_xxxxx',
    annual: process.env.RAZORPAY_PLAN_INR_ANNUAL || 'plan_xxxxx',
  },
}

export function getPlanId(currency: Currency, billingPeriod: BillingPeriod): string {
  const planId = RAZORPAY_PLAN_IDS[currency][billingPeriod]
  if (!planId || planId.startsWith('plan_xxxxx')) {
    throw new Error(`Plan ID not configured for ${currency} ${billingPeriod}`)
  }
  return planId
}
