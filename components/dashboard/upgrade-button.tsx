// components/dashboard/upgrade-button.tsx
// UPDATED: Provider-agnostic upgrade button

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PRICING, getPriceDisplay, getSavingsText, type Currency, type BillingPeriod } from '@/types/subscription'
import { getActiveProvider } from '@/types/payment'

interface UpgradeButtonProps {
  customerId: string
  customerEmail: string
  customerName: string
  currentCurrency?: Currency
  currentBillingPeriod?: BillingPeriod
  showSelector?: boolean
}

export default function UpgradeButton({ 
  customerId, 
  customerEmail, 
  customerName,
  currentCurrency = 'INR',
  currentBillingPeriod = 'monthly',
  showSelector = true,
}: UpgradeButtonProps) {
  const [currency, setCurrency] = useState<Currency>(currentCurrency)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(currentBillingPeriod)
  const [isLoading, setIsLoading] = useState(false)

  const activeProvider = getActiveProvider()

  const handleUpgrade = async () => {
    console.log('🔹 Starting upgrade process with', activeProvider)
    setIsLoading(true)

    try {
      // Use unified API endpoint
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
        console.log('🔀 Redirecting to Dodo checkout:', checkoutUrl)
        window.location.href = checkoutUrl
      } else if (activeProvider === 'razorpay' && subscriptionId) {
        // Razorpay: Open modal (existing flow)
        await openRazorpayModal(subscriptionId)
      } else {
        throw new Error('Invalid payment response')
      }
    } catch (error) {
      console.error('❌ Error initiating payment:', error)
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to initiate payment.',
      })
      setIsLoading(false)
    }
  }

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
      handler: async function (response: any) {
        toast.success('Payment Successful! 🎉', {
          description: 'Verifying your payment...',
        })
        
        try {
          const verifyResponse = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })

          const result = await verifyResponse.json()

          if (verifyResponse.ok && result.success) {
            toast.success("Subscription Activated! ✅")
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
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false)
        },
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.on('payment.failed', function (response: any) {
      toast.error('Payment Failed', {
        description: response.error.description || 'Please try again.',
      })
      setIsLoading(false)
    })
    rzp.open()
  }

  const plan = PRICING[currency]

  if (!showSelector) {
    return (
      <Button onClick={handleUpgrade} disabled={isLoading} size="lg" className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Upgrade to Pro - ${getPriceDisplay(currency, billingPeriod)}`
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Currency Selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Currency
        </label>
        <div className="flex gap-2">
          <Button
            variant={currency === 'INR' ? 'default' : 'outline'}
            onClick={() => setCurrency('INR')}
            className="flex-1"
            size="sm"
          >
            🇮🇳 INR (₹)
          </Button>
          <Button
            variant={currency === 'USD' ? 'default' : 'outline'}
            onClick={() => setCurrency('USD')}
            className="flex-1"
            size="sm"
          >
            🇺🇸 USD ($)
          </Button>
        </div>
      </div>

      {/* Billing Period Selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Billing Period
        </label>
        <div className="flex gap-2">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('monthly')}
            className="flex-1"
            size="sm"
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === 'annual' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('annual')}
            className="flex-1 relative"
            size="sm"
          >
            Annual
            <Badge className="ml-2 bg-green-500 text-xs">
              Save 10%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Price Display */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {plan.symbol}{billingPeriod === 'monthly' ? plan.monthly : plan.annualMonthly}
          </div>
          <div className="text-sm text-gray-600 mt-1">per month</div>
          {billingPeriod === 'annual' && (
            <>
              <div className="text-xs text-green-600 font-medium mt-2">
                {getSavingsText(currency)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Billed {plan.symbol}{plan.annual} annually
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subscribe Button */}
      <Button 
        onClick={handleUpgrade} 
        disabled={isLoading} 
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe Now - ${getPriceDisplay(currency, billingPeriod)}`
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Secure payment powered by {activeProvider === 'dodo' ? 'DodoPayments' : 'Razorpay'} • Cancel anytime
      </p>
    </div>
  )
}