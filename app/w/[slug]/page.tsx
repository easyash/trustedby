// app/w/[slug]/page.tsx
// Public Wall of Love page - SEO optimized

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, website_url')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!workspace) {
    return {
      title: 'Workspace Not Found',
    }
  }

  return {
    title: `${workspace.name} - Customer Testimonials`,
    description: `Read what customers are saying about ${workspace.name}`,
    openGraph: {
      title: `${workspace.name} - Wall of Love`,
      description: `Discover authentic testimonials from ${workspace.name} customers`,
    },
  }
}

export default async function PublicWallPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Fetch workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (workspaceError || !workspace) {
    notFound()
  }

  // Fetch approved testimonials
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('workspace_id', workspace.id)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {workspace.logo_url && (
                <img 
                  src={workspace.logo_url} 
                  alt={workspace.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {workspace.name}
                </h1>
                {workspace.website_url && (
                  <a 
                    href={workspace.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Powered by</p>
              <p className="font-semibold text-gray-900">TrustedBy</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Wall of Love ❤️
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers are saying
          </p>
          {testimonials && testimonials.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Testimonials Grid */}
        {!testimonials || testimonials.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                No testimonials yet. Be the first to share your experience!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card 
                key={testimonial.id} 
                className="hover:shadow-lg transition-shadow border-l-4"
                style={{ borderLeftColor: workspace.brand_color ?? undefined }}
              >
                <CardContent className="p-6">
                  {/* Rating */}
                  {testimonial.rating != null && (
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating!
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {testimonial.author_avatar_url ? (
                      <img
                        src={testimonial.author_avatar_url}
                        alt={testimonial.author_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                        {testimonial.author_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {testimonial.author_name}
                      </p>
                      {testimonial.author_title && (
                        <p className="text-sm text-gray-600 truncate">
                          {testimonial.author_title}
                          {testimonial.author_company && ` • ${testimonial.author_company}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Video Badge */}
                  {testimonial.media_type === 'video' && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        📹 Video Testimonial
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Want to collect testimonials for your business?{' '}
            <a 
              href={process.env.NEXT_PUBLIC_APP_URL || 'https://trustedby.app'}
              className="text-blue-600 hover:underline font-medium"
            >
              Try TrustedBy
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}