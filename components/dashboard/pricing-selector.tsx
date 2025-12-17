// components/dashboard/pricing-selector.tsx
// FULL DEBUG VERSION - Use this to diagnose the issue
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  currentCurrency = 'USD',
  currentBillingPeriod = 'monthly',
}: PricingSelectorProps) {
  const [currency, setCurrency] = useState<Currency>(currentCurrency)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(currentBillingPeriod)
  const [isLoading, setIsLoading] = useState(false)

  // STEP 1: Define verifyPayment FIRST
  const verifyPayment = async (paymentData: any) => {
    console.log('🔍 [VERIFY] Function called with:', paymentData)
    
    try {
      console.log('🔍 [VERIFY] Making API request to /api/razorpay/verify-payment')
      
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_subscription_id: paymentData.razorpay_subscription_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      })

      console.log('📡 [VERIFY] Response status:', response.status)
      console.log('📡 [VERIFY] Response ok:', response.ok)

      const result = await response.json()
      console.log('📋 [VERIFY] Response data:', result)

      if (response.ok && result.success) {
        console.log('✅ [VERIFY] Verification successful!')
        toast.success("Subscription Activated! ✅", {
          description: "Your Pro plan is now active. Redirecting...",
        })
        setTimeout(() => {
          console.log('🔄 [VERIFY] Redirecting to settings...')
          window.location.href = '/dashboard/settings#subscription'
        }, 2000)
      } else {
        console.error('❌ [VERIFY] Verification failed:', result.error)
        throw new Error(result.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('❌ [VERIFY] Exception caught:', error)
      toast.error("Verification Error", {
        description: error instanceof Error ? error.message : "Failed to verify payment.",
      })
    } finally {
      console.log('🏁 [VERIFY] Setting loading to false')
      setIsLoading(false)
    }
  }

  const handleSubscribe = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 [SUBSCRIBE] Starting subscription process')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    setIsLoading(true)

    try {
      console.log('📝 [SUBSCRIBE] Customer ID:', customerId)
      console.log('📝 [SUBSCRIBE] Currency:', currency)
      console.log('📝 [SUBSCRIBE] Billing Period:', billingPeriod)

      // Create subscription
      console.log('📝 [SUBSCRIBE] Calling /api/razorpay/create-subscription')
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          currency,
          billingPeriod,
        }),
      })

      console.log('📡 [SUBSCRIBE] Response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ [SUBSCRIBE] API error:', error)
        throw new Error(error.error || 'Failed to create subscription')
      }

      const { subscriptionId, shortUrl } = await response.json()
      console.log('✅ [SUBSCRIBE] Subscription created!')
      console.log('   - Subscription ID:', subscriptionId)
      console.log('   - Short URL:', shortUrl)

      // Wait for Razorpay SDK
      console.log('⏳ [SUBSCRIBE] Checking for Razorpay SDK...')
      let attempts = 0
      while (typeof (window as any).Razorpay === 'undefined' && attempts < 50) {
        console.log(`   - Attempt ${attempts + 1}/50: Waiting...`)
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (typeof (window as any).Razorpay === 'undefined') {
        console.error('❌ [SUBSCRIBE] Razorpay SDK not loaded after 5 seconds')
        throw new Error('Razorpay SDK not loaded. Please refresh and try again.')
      }
      console.log('✅ [SUBSCRIBE] Razorpay SDK loaded successfully')

      // Create handler function
      console.log('🔧 [SUBSCRIBE] Creating payment handler function')
      const paymentHandler = function (response: any) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('💳 [HANDLER] PAYMENT SUCCESSFUL!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('💳 [HANDLER] Response object:', response)
        console.log('💳 [HANDLER] Response keys:', Object.keys(response))
        console.log('💳 [HANDLER] Payment ID:', response.razorpay_payment_id)
        console.log('💳 [HANDLER] Subscription ID:', response.razorpay_subscription_id)
        console.log('💳 [HANDLER] Signature:', response.razorpay_signature)
        
        toast.success("Payment Successful! 🎉", {
          description: "Verifying your payment...",
        })
        
        console.log('⚡ [HANDLER] Calling verifyPayment function')
        console.log('⚡ [HANDLER] verifyPayment type:', typeof verifyPayment)
        
        try {
          verifyPayment(response)
          console.log('✅ [HANDLER] verifyPayment called successfully')
        } catch (error) {
          console.error('❌ [HANDLER] Error calling verifyPayment:', error)
        }
      }

      // Razorpay options
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
        handler: paymentHandler, // Use the named function
        modal: {
          ondismiss: function () {
            console.log('🚪 [MODAL] User dismissed the modal')
            setIsLoading(false)
          },
        },
      }

      console.log('🔧 [SUBSCRIBE] Razorpay options configured')
      console.log('   - Key:', options.key)
      console.log('   - Subscription ID:', options.subscription_id)
      console.log('   - Handler type:', typeof options.handler)

      console.log('🚀 [SUBSCRIBE] Opening Razorpay modal...')
      const rzp = new (window as any).Razorpay(options)
      
      rzp.on('payment.failed', function (response: any) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ [FAILED] Payment failed!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ [FAILED] Error:', response.error)
        toast.error("Payment Failed", {
          description: response.error.description || "Please try again.",
        })
        setIsLoading(false)
      })
      
      rzp.open()
      console.log('✅ [SUBSCRIBE] Razorpay modal opened')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('⏳ [SUBSCRIBE] Waiting for user to complete payment...')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ [SUBSCRIBE] Error in subscription process:', error)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      toast.error("Error", {
        description: error.message || "Failed to initiate payment.",
      })
      setIsLoading(false)
    }
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
            Secure payment powered by Razorpay • Cancel anytime
          </p>
        </CardContent>
      </Card>
    </div>
  )
}