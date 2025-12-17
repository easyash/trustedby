// components/dashboard/upgrade-prompt.tsx
// Reusable upgrade prompt banner

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface UpgradePromptProps {
  message: string
  daysRemaining?: number
  showDismiss?: boolean
  variant?: 'warning' | 'urgent' | 'expired'
}

export default function UpgradePrompt({ 
  message, 
  daysRemaining, 
  showDismiss = false,
  variant = 'warning' 
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const styles = {
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    urgent: {
      container: 'bg-orange-50 border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-900',
      button: 'bg-orange-600 hover:bg-orange-700',
    },
    expired: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      button: 'bg-red-600 hover:bg-red-700',
    },
  }

  const style = styles[variant]

  return (
    <Card className={`border-2 ${style.container}`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AlertTriangle className={`w-6 h-6 ${style.icon}`} />
            <div>
              <p className={`font-semibold ${style.text}`}>
                {message}
              </p>
              {daysRemaining !== undefined && daysRemaining > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining in your trial
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings">
              <Button className={style.button}>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
            {showDismiss && (
              <button
                onClick={() => setDismissed(true)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for inline use
export function InlineUpgradePrompt({ message }: { message: string }) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm font-medium text-yellow-900">{message}</p>
        </div>
        <Link href="/dashboard/settings">
          <Button size="sm" variant="outline">
            Upgrade
          </Button>
        </Link>
      </div>
    </div>
  )
}