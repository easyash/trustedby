// lib/dodo/client.ts
// DodoPayments API client - CORRECTED based on official documentation

interface DodoConfig {
  apiKey: string
  baseUrl: string
}

class DodoPaymentsClient {
  private config: DodoConfig

  constructor() {
    if (!process.env.DODO_API_KEY) {
      throw new Error('DODO_API_KEY not configured')
    }

    // Use correct base URL based on environment
    const isTestMode = process.env.DODO_ENVIRONMENT === 'test_mode'
    
    this.config = {
      apiKey: process.env.DODO_API_KEY,
      baseUrl: isTestMode 
        ? 'https://test.dodopayments.com'
        : 'https://dodopayments.com',
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    console.log('🔹 Dodo API Request:', {
      method: options.method || 'GET',
      url,
      hasBody: !!options.body
    })
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Dodo API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      let errorMessage
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || response.statusText
      } catch {
        errorMessage = errorText || response.statusText
      }
      
      throw new Error(`DodoPayments API error: ${errorMessage}`)
    }

    return response.json()
  }

  /**
   * Create a checkout session (Official Dodo API method)
   * This is the correct way to create subscriptions in Dodo
   */
  async createCheckoutSession(data: {
    product_cart: Array<{
      product_id: string
      quantity: number
    }>
    customer: {
      email: string
      name?: string
    }
    return_url: string
    subscription_data?: {
      trial_period_days?: number
    }
    metadata?: Record<string, any>
  }) {
    return this.makeRequest('/checkouts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`)
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string) {
    return this.makeRequest(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({
        // Dodo will cancel at end of current period by default
      }),
    })
  }

  /**
   * List customer subscriptions
   */
  async listCustomerSubscriptions(customerEmail: string) {
    return this.makeRequest(`/subscriptions?customer_email=${encodeURIComponent(customerEmail)}`)
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(subscriptionId: string, data: {
    type: 'new' | 'existing'
    payment_method_id?: string
    return_url?: string
  }) {
    return this.makeRequest(`/subscriptions/${subscriptionId}/payment-method`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * List payments
   */
  async listPayments(params?: {
    customer_email?: string
    subscription_id?: string
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params?.customer_email) queryParams.append('customer_email', params.customer_email)
    if (params?.subscription_id) queryParams.append('subscription_id', params.subscription_id)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const query = queryParams.toString()
    return this.makeRequest(`/payments${query ? '?' + query : ''}`)
  }
}

let dodoInstance: DodoPaymentsClient | null = null

export function getDodoClient(): DodoPaymentsClient {
  if (!dodoInstance) {
    dodoInstance = new DodoPaymentsClient()
  }
  return dodoInstance
}

export const dodo = new Proxy({} as DodoPaymentsClient, {
  get: (target, prop) => {
    const client = getDodoClient()
    return (client as any)[prop]
  }
})