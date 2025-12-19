// lib/dodo/plans.ts
// DodoPayments product/plan IDs configuration

import { Currency, BillingPeriod, PRICING } from '@/types/subscription'

// Store your DodoPayments Product IDs here
// You need to create these products in DodoPayments Dashboard
export const DODO_PRODUCT_IDS: Record<Currency, Record<BillingPeriod, string>> = {
  USD: {
    monthly: process.env.DODO_PRODUCT_USD_MONTHLY || '',
    annual: process.env.DODO_PRODUCT_USD_ANNUAL || '',
  },
  INR: {
    monthly: process.env.DODO_PRODUCT_INR_MONTHLY || '',
    annual: process.env.DODO_PRODUCT_INR_ANNUAL || '',
  },
}

export function getDodoProductId(currency: Currency, billingPeriod: BillingPeriod): string {
  const productId = DODO_PRODUCT_IDS[currency][billingPeriod]
  if (!productId) {
    throw new Error(`DodoPayments Product ID not configured for ${currency} ${billingPeriod}`)
  }
  return productId
}

// Get pricing amount for Dodo (in smallest currency unit)
export function getDodoAmount(currency: Currency, billingPeriod: BillingPeriod): number {
  const plan = PRICING[currency]
  const amount = billingPeriod === 'monthly' ? plan.monthly : plan.annual
  
  // Dodo expects amounts in smallest unit (cents for USD, paise for INR)
  return currency === 'USD' ? amount * 100 : amount * 100
}

// Convert billing period format
export function getDodoBillingPeriod(billingPeriod: BillingPeriod): 'monthly' | 'yearly' {
  return billingPeriod === 'annual' ? 'yearly' : 'monthly'
}