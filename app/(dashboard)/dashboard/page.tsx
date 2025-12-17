// app/(dashboard)/dashboard/page.tsx
// Main dashboard overview page

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces, getTestimonialStats } from '@/lib/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Clock, CheckCircle, Link as LinkIcon, Copy } from 'lucide-react'
import Link from 'next/link'
import CollectionLinkCard from '@/components/dashboard/collection-link-card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customer = await getCurrentUser()
  const workspaces = await getUserWorkspaces(user.id)
  const workspace = workspaces[0] // For MVP, use first workspace

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Workspace Found</CardTitle>
            <CardDescription>
              It looks like you don't have a workspace yet. This shouldn't happen!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Please contact support or try signing up again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get stats for the workspace
  const stats = await getTestimonialStats(workspace.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s what&apos;s happening with your testimonials
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Testimonials"
          value={stats.total}
          icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
          description="All submissions"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          description="Awaiting moderation"
          link="/dashboard/testimonials/moderation"
        />
        <StatCard
          title="Published"
          value={stats.approved}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          description="Live on your site"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Link */}
        <CollectionLinkCard
          linkId={workspace.collection_link_id}
          workspaceName={workspace.name}
        />

        {/* Widget Embed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              Widget Embed Code
            </CardTitle>
            <CardDescription>
              Add testimonials to your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Copy your widget code and paste it into your website to display your testimonials.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/embed">
                Get Embed Code →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide (if no testimonials) */}
      {stats.total === 0 && (
        <Card className="border-2 border-blue-100 bg-blue-50/50">
          <CardHeader>
            <CardTitle>🚀 Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to start collecting testimonials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <strong>Share your collection link</strong>
                  <p className="text-gray-600">
                    Send it to customers via email, social media, or add it to your website
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <strong>Review submissions</strong>
                  <p className="text-gray-600">
                    When someone submits, review and approve it from the moderation page
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <strong>Display on your site</strong>
                  <p className="text-gray-600">
                    Copy the widget code and paste it anywhere on your website
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Public Wall Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Public Wall of Love</CardTitle>
          <CardDescription>
            Share this page to showcase all your testimonials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm">
              {process.env.NEXT_PUBLIC_APP_URL}/w/{workspace.slug}
            </code>
            <Button variant="outline" asChild>
              <a 
                href={`/w/${workspace.slug}`} 
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  description,
  link,
}: {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  link?: string
}) {
  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </>
  )

  if (link) {
    return (
      <Link href={link}>
        <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
          {content}
        </Card>
      </Link>
    )
  }

  return <Card>{content}</Card>
}