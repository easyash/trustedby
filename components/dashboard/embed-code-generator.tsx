'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Copy, Code, ExternalLink } from 'lucide-react'

interface Workspace {
  [key: string]: unknown
}

interface EmbedCodeGeneratorProps {
  workspace: Workspace
}

export default function EmbedCodeGenerator({ workspace }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/widget" data-workspace-id="${workspace.id}"></script>
<div id="trustedby-widget"></div>`

  useEffect(() => {
    // Fetch testimonials for preview
    fetch(`/api/widget/${workspace.id}`)
      .then(res => res.json())
      .then(data => {
        setTestimonials(data.testimonials || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load testimonials:', err)
        setLoading(false)
      })
  }, [workspace.id])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Embed Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Widget Embed Code
          </CardTitle>
          <CardDescription>
            Paste this code snippet anywhere in your HTML where you want the testimonials to appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
            <Button
              onClick={handleCopy}
              className="absolute top-2 right-2"
              size="sm"
              variant="secondary"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your widget will look on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
            {loading ? (
              <p className="text-center text-gray-500">Loading preview...</p>
            ) : testimonials.length === 0 ? (
              <div className="text-center text-gray-500">
                <p className="mb-2">No approved testimonials yet</p>
                <p className="text-sm">Approve some testimonials to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testimonials.slice(0, 3).map((t: any) => (
                  <div key={t.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-sm italic text-gray-800 mb-2">"{t.content.substring(0, 100)}..."</p>
                    <p className="text-xs font-semibold text-gray-600">— {t.author_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guides */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guides</CardTitle>
          <CardDescription>
            Platform-specific instructions for popular website builders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Carrd', url: '#' },
              { name: 'Framer', url: '#' },
              { name: 'Webflow', url: '#' },
            ].map((platform) => (
              <Button key={platform.name} variant="outline" className="justify-between" asChild>
                <a href={platform.url}>
                  {platform.name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}