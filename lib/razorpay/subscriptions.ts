// lib/razorpay/subscriptions.ts
// Razorpay subscription management

import { getRazorpayClient } from './client'

export async function createSubscription(planId: string, customerId: string) {
  try {
    const razorpay = getRazorpayClient()
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
      addons: [],
      notes: {
        customer_id: customerId,
      },
    })

    return { success: true, subscription }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription'
    console.error('Error creating subscription:', error)
    return { success: false, error: errorMessage }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const razorpay = getRazorpayClient()
    const subscription = await razorpay.subscriptions.cancel(subscriptionId)
    return { success: true, subscription }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription'
    console.error('Error cancelling subscription:', error)
    return { success: false, error: errorMessage }
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const razorpay = getRazorpayClient()
    const subscription = await razorpay.subscriptions.fetch(subscriptionId)
    return { success: true, subscription }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subscription'
    console.error('Error fetching subscription:', error)
    return { success: false, error: errorMessage }
  }
}