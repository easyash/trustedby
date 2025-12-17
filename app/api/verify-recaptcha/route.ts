// app/api/verify-recaptcha/route.ts
// API route to verify reCAPTCHA tokens

import { NextResponse } from 'next/server'
import { verifyRecaptcha } from '@/lib/recaptcha/verify'

export async function POST(request: Request) {
  try {
    const { token, action } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    if (!action || !['login', 'signup'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA
    const result = await verifyRecaptcha(token, action as 'login' | 'signup')

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Success
    return NextResponse.json({
      success: true,
      score: result.score,
    })
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify reCAPTCHA' },
      { status: 500 }
    )
  }
}