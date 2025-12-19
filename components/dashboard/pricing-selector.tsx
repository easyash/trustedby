// components/dashboard/pricing-selector.tsx
// UPDATED VERSION - Provider-agnostic

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { PRICING, getPriceDisplay, getSavingsText, type Currency, type BillingPeriod } from '@/types/subscription'
import { toast } from 'sonner'

interface PricingSelectorProps {
  customerId: string
  customerEmail: string
  customerName: string
  currentCurrency?: Currency
  currentBillingPeriod?: BillingPeriod
}

export default function PricingSelector({ 
  customerId, 
  customerEmail, 
  customerName,
  currentCurrency = 'INR',
  currentBillingPeriod = 'monthly',
}: PricingSelectorProps) {
  const [currency, setCurrency] = useState<Currency>(currentCurrency)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(currentBillingPeriod)
  const [isLoading, setIsLoading] = useState(false)

  // Get active provider from env
  const activeProvider = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'dodo') as 'dodo' | 'razorpay'

  const handleSubscribe = async () => {
    console.log('🔹 Starting subscription with provider:', activeProvider)
    setIsLoading(true)

    try {
      // Use unified API endpoint for both providers
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          currency,
          billingPeriod,
          customerEmail,
          customerName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }

      const { subscriptionId, checkoutUrl, shortUrl } = await response.json()
      console.log('✅ Subscription created:', subscriptionId)

      // Handle based on provider
      if (activeProvider === 'dodo' && checkoutUrl) {
        // DodoPayments: Redirect to checkout
        console.log('🔀 Redirecting to Dodo checkout')
        window.location.href = checkoutUrl
      } else if (activeProvider === 'razorpay' && subscriptionId) {
        // Razorpay: Open modal (existing flow)
        await openRazorpayModal(subscriptionId)
      } else {
        throw new Error('Invalid payment response')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to initiate payment.',
      })
      setIsLoading(false)
    }
  }

  // Razorpay modal handler (existing logic)
  const openRazorpayModal = async (subscriptionId: string) => {
    // Wait for Razorpay SDK
    let attempts = 0
    while (typeof (window as any).Razorpay === 'undefined' && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    if (typeof (window as any).Razorpay === 'undefined') {
      throw new Error('Razorpay SDK not loaded. Please refresh and try again.')
    }

    const verifyPayment = async (paymentData: any) => {
      try {
        const response = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_subscription_id: paymentData.razorpay_subscription_id,
            razorpay_signature: paymentData.razorpay_signature,
          }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          toast.success("Subscription Activated! ✅", {
            description: "Your Pro plan is now active. Redirecting...",
          })
          setTimeout(() => {
            window.location.href = '/dashboard/settings#subscription'
          }, 2000)
        } else {
          throw new Error(result.error || 'Payment verification failed')
        }
      } catch (error) {
        toast.error("Verification Error", {
          description: error instanceof Error ? error.message : "Failed to verify payment.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: 'TrustedBy',
      description: `Pro Plan - ${getPriceDisplay(currency, billingPeriod)}`,
      prefill: {
        email: customerEmail,
        name: customerName,
      },
      theme: {
        color: '#3B82F6',
      },
      handler: function (response: any) {
        toast.success("Payment Successful! 🎉", {
          description: "Verifying your payment...",
        })
        verifyPayment(response)
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false)
        },
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.on('payment.failed', function (response: any) {
      toast.error("Payment Failed", {
        description: response.error.description || "Please try again.",
      })
      setIsLoading(false)
    })
    rzp.open()
  }

  const plan = PRICING[currency]

  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Currency
        </label>
        <div className="flex gap-3">
          <Button
            variant={currency === 'USD' ? 'default' : 'outline'}
            onClick={() => setCurrency('USD')}
            className="flex-1"
          >
            🇺🇸 USD ($)
          </Button>
          <Button
            variant={currency === 'INR' ? 'default' : 'outline'}
            onClick={() => setCurrency('INR')}
            className="flex-1"
          >
            🇮🇳 INR (₹)
          </Button>
        </div>
      </div>

      {/* Billing Period Selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Billing Period
        </label>
        <div className="flex gap-3">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('monthly')}
            className="flex-1"
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === 'annual' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('annual')}
            className="flex-1 relative"
          >
            Annual
            <Badge className="ml-2 bg-green-500">Save 10%</Badge>
          </Button>
        </div>
      </div>

      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Pro Plan</CardTitle>
          <CardDescription>Everything you need to grow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Display */}
          <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-5xl font-bold text-gray-900">
              {plan.symbol}{billingPeriod === 'monthly' ? plan.monthly : plan.annualMonthly}
            </div>
            <div className="text-gray-600 mt-2">
              per month
            </div>
            {billingPeriod === 'annual' && (
              <div className="text-sm text-green-600 font-medium mt-2">
                {getSavingsText(currency)}
              </div>
            )}
            {billingPeriod === 'annual' && (
              <div className="text-xs text-gray-500 mt-1">
                Billed {plan.symbol}{plan.annual} annually
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              'Unlimited testimonials',
              'Magic collection link',
              'Text & video testimonials',
              'One-click moderation',
              'Customizable widget (themes, layouts)',
              'Email notifications',
              'No branding',
              'Priority support',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Subscribe Now - {getPriceDisplay(currency, billingPeriod)}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Secure payment powered by {activeProvider === 'dodo' ? 'DodoPayments' : 'Razorpay'} • Cancel anytime
          </p>
        </CardContent>
      </Card>
    </div>
  )
}