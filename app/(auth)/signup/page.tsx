// app/(auth)/signup/page.tsx
// Signup page with Google reCAPTCHA v3

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { Shield } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const { executeRecaptcha } = useGoogleReCaptcha()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Execute reCAPTCHA
      if (!executeRecaptcha) {
        console.warn('reCAPTCHA not available')
        // Continue without reCAPTCHA (fallback)
      } else {
        const token = await executeRecaptcha('signup')
        
        // Verify reCAPTCHA token on server
        const verifyResponse = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'signup' }),
        })

        const verifyResult = await verifyResponse.json()

        if (!verifyResult.success) {
          setError(verifyResult.error || 'Security verification failed. Please try again.')
          setLoading(false)
          return
        }
      }

      // Step 1: Sign up the user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (signupError) throw signupError
      if (!authData.user) throw new Error('No user data returned')

      // Step 2: Create customer record
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: email.split('@')[0],
        })

      if (customerError) throw customerError

      // Step 3: Create default workspace
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          customer_id: authData.user.id,
          name: 'My Workspace',
          slug: `workspace-${Math.random().toString(36).substring(2, 9)}`,
        })

      if (workspaceError) throw workspaceError

      // Success!
      setMessage('Success! Check your email to confirm your account.')
      
      // If email confirmation is disabled, redirect to dashboard
      if (authData.session) {
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
      }
      
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Navigation Bar */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TB</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TrustedBy</span>
          </div>

          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/signup" className="text-gray-900 font-semibold">Sign Up</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
          </nav>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TB</span>
              </div>
              <span className="font-bold text-2xl text-gray-900">TrustedBy</span>
            </Link>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start collecting testimonials in minutes</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              {/* reCAPTCHA Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Protected by reCAPTCHA</span>
              </div>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}