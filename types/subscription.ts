// types/subscription.ts
// Subscription types and pricing

export type Currency = 'USD' | 'INR'
export type BillingPeriod = 'monthly' | 'annual'

export interface PricingPlan {
  currency: Currency
  monthly: number
  annual: number
  annualMonthly: number // Effective monthly price for annual
  symbol: string
  displayName: string
}

export const PRICING: Record<Currency, PricingPlan> = {
  USD: {
    currency: 'USD',
    monthly: 12,
    annual: 120, // $10/month when billed annually (16% discount)
    annualMonthly: 10,
    symbol: '$',
    displayName: 'USD',
  },
  INR: {
    currency: 'INR',
    monthly: 999,
    annual: 10789, // ₹899/month when billed annually (10% discount)
    annualMonthly: 899,
    symbol: '₹',
    displayName: 'INR',
  },
}

export function getPriceDisplay(currency: Currency, billingPeriod: BillingPeriod): string {
  const plan = PRICING[currency]
  if (billingPeriod === 'monthly') {
    return `${plan.symbol}${plan.monthly}/month`
  }
  return `${plan.symbol}${plan.annualMonthly}/month (${plan.symbol}${plan.annual}/year)`
}

export function getSavingsText(currency: Currency): string {
  const plan = PRICING[currency]
  const monthlyCost = plan.monthly * 12
  const savings = monthlyCost - plan.annual
  const percentage = Math.round((savings / monthlyCost) * 100)
  return `Save ${plan.symbol}${savings} (${percentage}% off)`
}