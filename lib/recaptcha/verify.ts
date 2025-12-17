// lib/recaptcha/verify.ts
// Server-side reCAPTCHA verification

export async function verifyRecaptcha(
  token: string,
  action: 'login' | 'signup'
): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY not found in environment variables')
    return { success: false, error: 'reCAPTCHA not configured' }
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    // Check if verification was successful
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes'])
      return { 
        success: false, 
        error: 'reCAPTCHA verification failed' 
      }
    }

    // Check if action matches
    if (data.action !== action) {
      console.error(`reCAPTCHA action mismatch. Expected: ${action}, Got: ${data.action}`)
      return { 
        success: false, 
        error: 'Invalid reCAPTCHA action' 
      }
    }

    // Check score (0.0 - 1.0, higher is more human-like)
    const score = data.score || 0
    const minimumScore = 0.5 // Adjust this threshold as needed

    if (score < minimumScore) {
      console.warn(`Low reCAPTCHA score: ${score} (minimum: ${minimumScore})`)
      return { 
        success: false, 
        score,
        error: 'Suspicious activity detected. Please try again.' 
      }
    }

    // Success!
    return { success: true, score }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return { 
      success: false, 
      error: 'Failed to verify reCAPTCHA' 
    }
  }
}