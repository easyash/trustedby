// lib/razorpay/client.ts
// Razorpay client setup

import Razorpay from 'razorpay'

let razorpayInstance: Razorpay | null = null

export function getRazorpayClient(): Razorpay {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured')
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }

  return razorpayInstance
}

// For backward compatibility
export const razorpay = new Proxy({} as Razorpay, {
  get: (target, prop) => {
    const client = getRazorpayClient()
    return client[prop as keyof Razorpay]
  }
})