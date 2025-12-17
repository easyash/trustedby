// components/dashboard/update-payment-modal.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UpdatePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionId: string
}

// Razorpay TS type (minimal and safe)
interface RazorpayInstance {
  open: () => void
}

export default function UpdatePaymentModal({
  isOpen,
  onClose,
  subscriptionId,
}: UpdatePaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Load Razorpay script on mount (only once)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).Razorpay) return // already loaded

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  if (!isOpen) return null

  const handleUpdatePayment = async () => {
    setIsLoading(true)

    try {
      const Razorpay = (window as any).Razorpay as
        | (new (options: unknown) => RazorpayInstance)
        | undefined

      if (!Razorpay) {
        toast.error('Payment system loading...', {
          description: 'Please wait a moment and try again.',
        })
        setIsLoading(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'TrustedBy',
        description: 'Update Payment Method',
        handler: () => {
          toast.success('Payment Method Updated!', {
            description: 'Your payment method has been updated successfully.',
          })
          onClose()
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          },
        },
        theme: {
          color: '#3b82f6',
        },
      }

      const rzp = new Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Update payment error:', error)
      toast.error('Error', {
        description: 'Failed to open payment form. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Update Payment Method</CardTitle>
                <CardDescription className="mt-2">
                  Add or change your payment card
                </CardDescription>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p>You&apos;ll be redirected to Razorpay&apos;s secure payment form to update your card details.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleUpdatePayment}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Update Payment Method'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
