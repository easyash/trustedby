// lib/dodo/client.ts
// DodoPayments API client - FINAL FIX: Remove /api from base URL

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

    // Determine base URL based on environment
    const isTestMode = process.env.DODO_ENVIRONMENT === 'test_mode'
    
    this.config = {
      apiKey: process.env.DODO_API_KEY,
      // FIXED: Remove /api suffix - the endpoint paths already include the full path
      baseUrl: isTestMode 
        ? 'https://test.dodopayments.com'
        : 'https://dodopayments.com',
    }

    console.log('🔧 Dodo Client Config:', {
      baseUrl: this.config.baseUrl,
      environment: isTestMode ? 'test_mode' : 'live_mode',
      hasApiKey: !!this.config.apiKey
    })
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    console.log('📤 Dodo API Request:', {
      method: options.method || 'GET',
      url,
      headers: {
        'Authorization': 'Bearer ***',
        'Content-Type': 'application/json',
      }
    })

    if (options.body) {
      console.log('📤 Request Body:', JSON.parse(options.body as string))
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    console.log('📥 Dodo API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Dodo API Error Response:', errorText)
      
      let errorMessage
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || response.statusText
      } catch {
        errorMessage = errorText || response.statusText
      }
      
      throw new Error(`DodoPayments API error: ${errorMessage}`)
    }

    const responseData = await response.json()
    console.log('✅ Response Data:', responseData)
    
    return responseData
  }

  /**
   * Create a checkout session
   * Official endpoint from Dodo docs: POST /checkouts
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
    console.log('🛒 Creating checkout session with data:', data)
    
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
      body: JSON.stringify({}),
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