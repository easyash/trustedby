// types/payment.ts
// Payment provider types and configuration

export type PaymentProvider = 'dodo' | 'razorpay'

export interface PaymentProviderConfig {
  provider: PaymentProvider
  enabled: boolean
}

export const PAYMENT_CONFIG: PaymentProviderConfig = {
  provider: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as PaymentProvider) || 'dodo',
  enabled: true,
}

// Check which provider is active
export function isRazorpayEnabled(): boolean {
  return PAYMENT_CONFIG.provider === 'razorpay'
}

export function isDodoPaymentsEnabled(): boolean {
  return PAYMENT_CONFIG.provider === 'dodo'
}

export function getActiveProvider(): PaymentProvider {
  return PAYMENT_CONFIG.provider
}

// Provider-specific field mapping for customers table
export interface ProviderFields {
  subscription_id: string
  customer_id: string
  plan_monthly_usd?: string
  plan_annual_usd?: string
  plan_monthly_inr?: string
  plan_annual_inr?: string
}

export const PROVIDER_FIELD_MAP: Record<PaymentProvider, ProviderFields> = {
  razorpay: {
    subscription_id: 'razorpay_subscription_id',
    customer_id: 'razorpay_customer_id',
    plan_monthly_usd: 'RAZORPAY_PLAN_USD_MONTHLY',
    plan_annual_usd: 'RAZORPAY_PLAN_USD_ANNUAL',
    plan_monthly_inr: 'RAZORPAY_PLAN_INR_MONTHLY',
    plan_annual_inr: 'RAZORPAY_PLAN_INR_ANNUAL',
  },
  dodo: {
    subscription_id: 'subscription_id', // Generic field
    customer_id: 'lemon_squeezy_customer_id', // Reuse this field for Dodo
    plan_monthly_usd: 'DODO_PLAN_USD_MONTHLY',
    plan_annual_usd: 'DODO_PLAN_USD_ANNUAL',
    plan_monthly_inr: 'DODO_PLAN_INR_MONTHLY',
    plan_annual_inr: 'DODO_PLAN_INR_ANNUAL',
  },
}