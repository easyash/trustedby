// lib/dodo/client.ts
// DodoPayments API client - CORRECTED based on official docs

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

    this.config = {
      apiKey: process.env.DODO_API_KEY,
      baseUrl: process.env.DODO_API_URL || 'https://api.dodo.com',
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        error.message || `DodoPayments API error: ${response.statusText}`
      )
    }

    return response.json()
  }

  // Create a payment link for subscription
  async createPaymentLink(data: {
    product_id: string
    customer_email: string
    customer_name?: string
    success_url: string
    cancel_url: string
    metadata?: Record<string, any>
  }) {
    return this.makeRequest('/payment-links', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Get payment link details
  async getPaymentLink(paymentLinkId: string) {
    return this.makeRequest(`/payment-links/${paymentLinkId}`)
  }

  // Get subscription details
  async getSubscription(subscriptionId: string) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`)
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, data?: {
    cancel_at_period_end?: boolean
  }) {
    return this.makeRequest(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data || { cancel_at_period_end: true }),
    })
  }

  // List customer subscriptions
  async listCustomerSubscriptions(customerEmail: string) {
    return this.makeRequest(`/subscriptions?customer_email=${encodeURIComponent(customerEmail)}`)
  }

  // Get customer details
  async getCustomer(customerEmail: string) {
    return this.makeRequest(`/customers/${encodeURIComponent(customerEmail)}`)
  }

  // List payments
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