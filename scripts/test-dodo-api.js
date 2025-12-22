// scripts/test-dodo-api.js
// Run this to test your Dodo API connection directly
// Usage: node scripts/test-dodo-api.js

require('dotenv').config({ path: '.env.local' })

async function testDodoAPI() {
  console.log('🧪 Testing DodoPayments API Connection\n')
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log('  DODO_API_KEY:', process.env.DODO_API_KEY ? '✅ Set' : '❌ Missing')
  console.log('  DODO_ENVIRONMENT:', process.env.DODO_ENVIRONMENT || 'not set (defaults to live_mode)')
  console.log('  DODO_PRODUCT_INR_MONTHLY:', process.env.DODO_PRODUCT_INR_MONTHLY || '❌ Missing')
  console.log('')

  if (!process.env.DODO_API_KEY) {
    console.error('❌ DODO_API_KEY is not set!')
    process.exit(1)
  }

  const isTestMode = process.env.DODO_ENVIRONMENT === 'test_mode'
  const baseUrl = isTestMode 
    ? 'https://test.dodopayments.com' 
    : 'https://dodopayments.com'
  
  console.log('🌐 API Configuration:')
  console.log('  Base URL:', baseUrl)
  console.log('  Mode:', isTestMode ? 'Test' : 'Live')
  console.log('')

  // Test 1: Simple API call to verify authentication
  console.log('📡 Test 1: Verifying API authentication...')
  try {
    const response = await fetch(`${baseUrl}/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('  Status:', response.status, response.statusText)
    
    if (response.ok) {
      console.log('  ✅ API authentication successful!')
      const data = await response.json()
      console.log('  Response:', JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.error('  ❌ API authentication failed!')
      console.error('  Error:', errorText)
    }
  } catch (error) {
    console.error('  ❌ Network error:', error.message)
  }
  console.log('')

  // Test 2: Create checkout session
  console.log('📡 Test 2: Creating checkout session...')
  
  const productId = process.env.DODO_PRODUCT_INR_MONTHLY
  if (!productId) {
    console.error('  ❌ DODO_PRODUCT_INR_MONTHLY not set, skipping test')
    return
  }

  const checkoutData = {
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
      },
    ],
    customer: {
      email: 'test@example.com',
      name: 'Test User',
    },
    return_url: 'https://example.com/success',
    metadata: {
      test: true,
      customer_id: 'test-customer-123',
    },
  }

  console.log('  Request Data:', JSON.stringify(checkoutData, null, 2))

  try {
    const response = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    })

    console.log('  Status:', response.status, response.statusText)
    
    const responseText = await response.text()
    
    if (response.ok) {
      console.log('  ✅ Checkout session created successfully!')
      const data = JSON.parse(responseText)
      console.log('  Session ID:', data.session_id)
      console.log('  Checkout URL:', data.checkout_url)
    } else {
      console.error('  ❌ Failed to create checkout session!')
      console.error('  Error:', responseText)
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText)
        console.error('  Error Details:', JSON.stringify(errorData, null, 2))
      } catch {
        // Error is not JSON
      }
    }
  } catch (error) {
    console.error('  ❌ Network error:', error.message)
  }
  console.log('')

  console.log('🏁 Test completed!')
}

testDodoAPI().catch(console.error)