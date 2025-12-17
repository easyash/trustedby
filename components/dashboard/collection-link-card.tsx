// components/dashboard/collection-link-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface CollectionLinkCardProps {
  linkId: string
  workspaceName: string
}

export default function CollectionLinkCard({ linkId, workspaceName }: CollectionLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const collectionUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/submit/${linkId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(collectionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          Magic Collection Link
        </CardTitle>
        <CardDescription>
          Share this link to collect testimonials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-medium">Your Collection URL:</p>
          <code className="text-sm text-gray-900 break-all block">
            {collectionUrl}
          </code>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="flex-1"
            variant={copied ? "default" : "default"}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            asChild
          >
            <a 
              href={collectionUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview
            </a>
          </Button>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>💡 <strong>Quick tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Add this link to your email signature</li>
            <li>Share it on social media</li>
            <li>Include it in "Thank You" emails</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}