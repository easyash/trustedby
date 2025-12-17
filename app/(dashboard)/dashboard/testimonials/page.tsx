// app/(dashboard)/dashboard/testimonials/page.tsx
// All testimonials view

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces, getTestimonials } from '@/lib/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Star, Video, Image as ImageIcon, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function TestimonialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customer = await getCurrentUser()
  const workspaces = await getUserWorkspaces(user.id)
  const workspace = workspaces[0]

  if (!workspace) {
    redirect('/dashboard')
  }

  const testimonials = await getTestimonials(workspace.id)

  // Group by status
  const approved = testimonials.filter(t => t.status === 'approved')
  const pending = testimonials.filter(t => t.status === 'pending')
  const rejected = testimonials.filter(t => t.status === 'rejected')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            All Testimonials
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all your testimonials in one place
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/testimonials/moderation">
            View Moderation Queue ({pending.length})
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approved.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No testimonials yet
            </h3>
            <p className="text-gray-600 mb-4">
              Share your collection link to start gathering testimonials
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className={`${
                testimonial.status === 'approved' ? 'border-l-4 border-green-500' :
                testimonial.status === 'pending' ? 'border-l-4 border-yellow-500' :
                'border-l-4 border-red-500 opacity-60'
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {testimonial.author_name}
                      {testimonial.status === 'approved' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {testimonial.status === 'pending' && (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                      {testimonial.status === 'rejected' && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </CardTitle>
                    {testimonial.author_title && (
                      <CardDescription>
                        {testimonial.author_title}
                        {testimonial.author_company && ` • ${testimonial.author_company}`}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      variant={
                        testimonial.status === 'approved' ? 'default' :
                        testimonial.status === 'pending' ? 'secondary' :
                        'destructive'
                      }
                    >
                      {testimonial.status}
                    </Badge>
                    {testimonial.media_type === 'video' && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    {testimonial.media_type === 'image' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Image
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (testimonial.rating ?? 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <p className="text-gray-800 mb-4 italic">&quot;{testimonial.content}&quot;</p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Submitted {testimonial.created_at 
                      ? new Date(testimonial.created_at).toLocaleDateString()
                      : 'Recently'
                    }
                  </span>
                  {testimonial.approved_at && (
                    <span>• Approved {new Date(testimonial.approved_at).toLocaleDateString()}</span>
                  )}
                  {testimonial.author_email && (
                    <span>• {testimonial.author_email}</span>
                  )}
                  <span>• via {testimonial.collected_via}</span>
                </div>

                {/* TODO: Add actions - Edit, Delete, Change Status */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}