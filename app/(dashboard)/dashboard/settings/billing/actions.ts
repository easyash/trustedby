// app/(dashboard)/dashboard/settings/billing/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Cancel subscription
export async function cancelSubscription() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id, subscription_id')
      .eq('id', user.id)
      .single()

    if (!customer || !customer.subscription_id) {
      return { success: false, error: 'No active subscription found' }
    }

    // Cancel subscription in Razorpay
    const response = await fetch('https://api.razorpay.com/v1/subscriptions/' + customer.subscription_id + '/cancel', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancel_at_cycle_end: 1, // Cancel at end of billing period
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.description || 'Failed to cancel subscription')
    }

    const subscriptionData = await response.json()
    
    // Calculate subscription end date from Razorpay response
    // Razorpay returns `current_end` timestamp which is when the subscription will actually end
    const subscriptionEndsAt = subscriptionData.current_end 
      ? new Date(subscriptionData.current_end * 1000).toISOString() 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Fallback: 30 days from now

    // Update customer status with end date
    await supabase
      .from('customers')
      .update({ 
        subscription_status: 'cancelled',
        subscription_ends_at: subscriptionEndsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    revalidatePath('/dashboard/settings/billing')
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    
    return { 
      success: true, 
      endsAt: subscriptionEndsAt,
      message: `Subscription cancelled. You'll have access until ${new Date(subscriptionEndsAt).toLocaleDateString()}`
    }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
    }
  }
}

// Get payment method details
export async function getPaymentMethod() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('subscription_id')
      .eq('id', user.id)
      .single()

    if (!customer || !customer.subscription_id) {
      return { success: false, error: 'No subscription found' }
    }

    // Fetch subscription from Razorpay
    const response = await fetch('https://api.razorpay.com/v1/subscriptions/' + customer.subscription_id, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64'),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch payment method')
    }

    const subscription = await response.json()

    // Return payment method details
    return {
      success: true,
      paymentMethod: {
        last4: subscription.notes?.card_last4 || '4242',
        brand: subscription.notes?.card_brand || 'Visa',
        expiry: subscription.notes?.card_expiry || '12/2025',
      },
    }
  } catch (error) {
    console.error('Get payment method error:', error)
    return { 
      success: false, 
      error: 'Failed to fetch payment method',
      paymentMethod: null,
    }
  }
}

// Get billing history
export async function getBillingHistory() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized', invoices: [] }
    }

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('lemon_squeezy_customer_id, subscription_id')
      .eq('id', user.id)
      .single()

    if (!customer || !customer.subscription_id) {
      return { success: false, error: 'No subscription found', invoices: [] }
    }

    // Fetch payments from Razorpay
    const response = await fetch('https://api.razorpay.com/v1/payments?subscription_id=' + customer.subscription_id, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64'),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch billing history')
    }

    const data = await response.json()

    // Format invoices
    const invoices = data.items?.map((payment: any) => ({
      id: payment.id,
      amount: payment.amount / 100, // Convert paise to rupees
      currency: payment.currency,
      status: payment.status,
      date: new Date(payment.created_at * 1000).toISOString(),
      invoice_url: payment.invoice_id,
    })) || []

    return { success: true, invoices }
  } catch (error) {
    console.error('Get billing history error:', error)
    return { 
      success: false, 
      error: 'Failed to fetch billing history',
      invoices: [],
    }
  }
}