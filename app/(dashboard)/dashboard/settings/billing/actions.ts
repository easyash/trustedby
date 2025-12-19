// app/(dashboard)/dashboard/settings/billing/actions.ts
// UPDATED: Provider-aware cancellation

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Import Dodo cancellation function
import { cancelDodoSubscription } from '@/lib/dodo/subscriptions'

// Cancel subscription - NOW PROVIDER-AWARE
export async function cancelSubscription() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get customer with all subscription fields
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    // Determine active provider and subscription ID
    const activeProvider = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'dodo') as 'dodo' | 'razorpay'
    
    const subscriptionId = activeProvider === 'razorpay' 
      ? customer.razorpay_subscription_id 
      : customer.subscription_id

    if (!subscriptionId) {
      return { success: false, error: 'No active subscription found' }
    }

    let subscriptionEndsAt: string

    // Cancel with appropriate provider
    if (activeProvider === 'razorpay') {
      console.log('🔹 Cancelling Razorpay subscription:', subscriptionId)
      
      // Existing Razorpay cancellation logic
      const response = await fetch(
        'https://api.razorpay.com/v1/subscriptions/' + subscriptionId + '/cancel',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET
            ).toString('base64'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancel_at_cycle_end: 1, // Cancel at end of billing period
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.description || 'Failed to cancel Razorpay subscription')
      }

      const subscriptionData = await response.json()
      
      // Calculate subscription end date from Razorpay response
      subscriptionEndsAt = subscriptionData.current_end 
        ? new Date(subscriptionData.current_end * 1000).toISOString() 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    } else {
      console.log('🔹 Cancelling Dodo subscription:', subscriptionId)
      
      // Dodo cancellation
      const result = await cancelDodoSubscription(subscriptionId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel Dodo subscription')
      }
      
      // Dodo typically provides end date, fallback to 30 days
      subscriptionEndsAt = result.subscription?.ends_at 
        ? new Date(result.subscription.ends_at).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

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
    console.error('❌ Cancel subscription error:', error)
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
      .select('subscription_id, razorpay_subscription_id')
      .eq('id', user.id)
      .single()

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    const activeProvider = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'dodo') as 'dodo' | 'razorpay'
    const subscriptionId = activeProvider === 'razorpay' 
      ? customer.razorpay_subscription_id 
      : customer.subscription_id

    if (!subscriptionId) {
      return { success: false, error: 'No subscription found' }
    }

    // For now, return mock data
    // In production, fetch from respective provider's API
    return {
      success: true,
      paymentMethod: {
        last4: '4242',
        brand: 'Visa',
        expiry: '12/2025',
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
      .select('subscription_id, razorpay_subscription_id')
      .eq('id', user.id)
      .single()

    if (!customer) {
      return { success: false, error: 'Customer not found', invoices: [] }
    }

    // For now, return empty array
    // In production, fetch from respective provider's API
    return { success: true, invoices: [] }
  } catch (error) {
    console.error('Get billing history error:', error)
    return { 
      success: false, 
      error: 'Failed to fetch billing history',
      invoices: [],
    }
  }
}