// components/payment-status-handler.tsx
'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function PaymentStatusHandler() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const paymentStatus = searchParams?.get('payment')
    
    if (paymentStatus === 'success') {
      toast.success('Payment Successful!', {
        description: 'Your subscription is now active.',
      })
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/settings#subscription')
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment Cancelled', {
        description: 'You can try again anytime.',
      })
      window.history.replaceState({}, '', '/dashboard/settings#subscription')
    }
  }, [searchParams])

  return null
}