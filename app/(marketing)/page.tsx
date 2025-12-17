// app/(marketing)/page.tsx
// Main landing page
'use client'

import Link from 'next/link'
import { ArrowRight, Check, Zap, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <span className="font-bold text-xl text-gray-900">TrustedBy</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 1,000+ indie hackers</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Collect & Display
              <span className="block text-blue-600">Beautiful Testimonials</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The simplest way to gather social proof and boost conversions.
              <span className="block mt-2">Built for solo founders. <strong>Just $12/month.</strong></span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-14" asChild>
                <Link href="/signup">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14" asChild>
                <Link href="#demo">
                  See Live Demo
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 rounded-xl border-4 border-gray-200 shadow-2xl overflow-hidden">
            <img 
              src="/demo-screenshot.png" 
              alt="TrustedBy Dashboard"
              className="w-full"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"%3E%3Crect fill="%23f3f4f6" width="1200" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" fill="%236b7280"%3EDashboard Preview%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 mb-8 font-medium">
            Trusted by founders building the next big thing
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['Product Hunt', 'Indie Hackers', 'Hacker News', 'Twitter/X'].map((platform) => (
              <div key={platform} className="text-2xl font-bold text-gray-400">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We focus on the essentials so you can collect social proof in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-blue-600" />}
              title="Magic Collection Link"
              description="Share one simple link everywhere. No forms, no hassle. Customers submit testimonials in 30 seconds."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="One-Click Moderation"
              description="Approve or reject testimonials instantly. Keep your wall clean and professional with zero effort."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-blue-600" />}
              title="Beautiful Widget"
              description="Copy one line of code. Paste it anywhere. Your Wall of Love loads instantly and looks amazing."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-xl text-gray-600">
              One plan. Unlimited testimonials. No surprises.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-8 md:p-12">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                <p className="text-gray-600">Perfect for indie hackers & startups</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-gray-900">$12</div>
                <div className="text-gray-600">/month</div>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Unlimited testimonials',
                'Magic collection link',
                'Text & video testimonials',
                'One-click moderation',
                'Customizable widget',
                'No branding',
                'Email support',
              ].map((feature) => (
                <li key={feature} className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button size="lg" className="w-full text-lg h-14" asChild>
              <Link href="/signup">
                Start 7-Day Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              No credit card required • Cancel anytime
            </p>
          </div>

          {/* Comparison */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Compare to competitors:</p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-gray-500">
                <span className="line-through">Testimonial.to: $49/mo</span>
              </div>
              <div className="text-gray-500">
                <span className="line-through">Senja: $39/mo</span>
              </div>
              <div className="text-blue-600 font-bold">
                TrustedBy: $12/mo ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to start collecting testimonials?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join 1,000+ founders who trust TrustedBy for their social proof
          </p>
          <Button size="lg" className="text-lg px-8 h-14" asChild>
            <Link href="/signup">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <span className="font-bold text-xl text-gray-900">TrustedBy</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900">Terms</Link>
              <Link href="/contact" className="hover:text-gray-900">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2024 TrustedBy. Built for indie hackers, by indie hackers.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}