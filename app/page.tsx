import Link from 'next/link'
import { ArrowRight, Check, Zap, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollToTop from '@/components/scroll-to-top'
import ReCaptchaProvider from '@/components/recaptcha-provider'

export default function LandingPage() {
  return (
    <ReCaptchaProvider>
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TB</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TrustedBy</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Trusted by 1,000+ indie hackers
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Collect & Display<br />
            <span className="text-blue-600">Beautiful Testimonials</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            The simplest way to gather social proof and boost conversions.<br />
            Built for solo founders. <strong>Just $12/month.</strong>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
            <Button size="lg" className="h-14 px-8 text-lg" asChild>
              <Link href="/signup">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500">No credit card required • 7-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 font-medium mb-8">Trusted by founders building the next big thing</p>

          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['Product Hunt', 'Indie Hackers', 'Hacker News', 'Twitter/X'].map((platform) => (
              <div key={platform} className="text-2xl text-gray-400 font-bold">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need. Nothing you don&apos;t.</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We focus on the essentials so you can collect social proof in minutes, not hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-blue-600" />}
            title="Magic Collection Link"
            description="Share one simple link everywhere. Customers submit testimonials in 30 seconds."
          />

          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-600" />}
            title="One-Click Moderation"
            description="Approve or reject testimonials instantly. Keep your wall clean and professional."
          />

          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-blue-600" />}
            title="Beautiful Widget"
            description="Copy one line of code. Paste it anywhere. Looks amazing everywhere."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, honest pricing</h2>
          <p className="text-xl text-gray-600">One plan. Unlimited testimonials. No surprises.</p>
        </div>

        <div className="bg-white max-w-3xl mx-auto border-2 border-blue-100 rounded-2xl p-10 shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-3xl font-bold">Pro Plan</h3>
              <p className="text-gray-600">Perfect for indie hackers & startups</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">$12</div>
              <div className="text-gray-600">/month</div>
            </div>
          </div>

          <ul className="space-y-3 mb-10">
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
                <Check className="w-5 h-5 text-green-600 mr-3" />
                {feature}
              </li>
            ))}
          </ul>

          <Button size="lg" className="w-full h-14 text-lg" asChild>
            <Link href="/signup">
              Start 7-Day Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            No credit card required • Cancel anytime
          </p>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Compare to competitors:</p>
            <div className="flex justify-center gap-8 text-sm">
              <span className="text-gray-500 line-through">Testimonial.to: $49/mo</span>
              <span className="text-gray-500 line-through">Senja: $39/mo</span>
              <span className="text-blue-600 font-bold">TrustedBy: $12/mo ✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start collecting testimonials?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join 1,000+ founders who trust TrustedBy for their social proof
          </p>

          <Button size="lg" className="h-14 px-8 text-lg" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TB</span>
            </div>
            <span className="font-bold text-xl">TrustedBy</span>
          </div>

          <div className="flex space-x-8 text-sm text-gray-600">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6 md:mt-0">
            © 2024 TrustedBy. Built for indie hackers, by indie hackers.
          </p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
    </ReCaptchaProvider>
  )
}

function FeatureCard({ icon, title, description }: {
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