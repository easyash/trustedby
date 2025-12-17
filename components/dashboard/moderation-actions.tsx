// components/dashboard/moderation-actions.tsx
// UPDATED: Maintains existing interface, adds subscription lock support

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { approveTestimonial, rejectTestimonial } from '@/app/(dashboard)/dashboard/testimonials/moderation/actions'
import Link from 'next/link'

interface ModerationActionsProps {
  testimonialId: string
  isDisabled: boolean  // EXISTING prop name - keep for backward compatibility
  authorEmail?: string  // EXISTING prop - keep for backward compatibility
}

export default function ModerationActions({ 
  testimonialId, 
  isDisabled,
  authorEmail,
}: ModerationActionsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const handleApprove = async () => {
    // Check if disabled (trial/subscription expired)
    if (isDisabled) {
      toast.error('Subscription Required', {
        description: 'Upgrade to Pro to approve testimonials',
        action: {
          label: 'Upgrade',
          onClick: () => router.push('/dashboard/settings'),
        },
      })
      return
    }

    setIsApproving(true)

    const result = await approveTestimonial(testimonialId)

    if (result.success) {
      toast.success('Testimonial Approved!', {
        description: authorEmail 
          ? `The testimonial is now live. ${authorEmail} will receive a notification.`
          : 'The testimonial is now visible on your website.',
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to approve testimonial',
      })
    }

    setIsApproving(false)
  }

  const handleReject = async () => {
    // Check if disabled (trial/subscription expired)
    if (isDisabled) {
      toast.error('Subscription Required', {
        description: 'Upgrade to Pro to reject testimonials',
        action: {
          label: 'Upgrade',
          onClick: () => router.push('/dashboard/settings'),
        },
      })
      return
    }

    const confirmed = confirm(
      'Are you sure you want to reject this testimonial?\n\n' +
      'This action cannot be undone.'
    )

    if (!confirmed) return

    setIsRejecting(true)

    const result = await rejectTestimonial(testimonialId)

    if (result.success) {
      toast.success('Testimonial Rejected', {
        description: 'The testimonial has been moved to rejected.',
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to reject testimonial',
      })
    }

    setIsRejecting(false)
  }

  // Locked state - show disabled buttons with lock icon
  if (isDisabled) {
    return (
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            disabled
            className="flex-1 opacity-50 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 mr-2" />
            Approve
          </Button>

          <Button
            variant="destructive"
            disabled
            className="flex-1 opacity-50 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            🔒 Moderation Locked
          </p>
          <p className="text-sm text-yellow-700 mb-3">
            Your subscription is inactive. Upgrade or resubscribe to approve/reject testimonials.
          </p>
          <Link href="/dashboard/settings#subscription">
            <Button size="sm" className="w-full">
              View Subscription
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Active state - normal buttons
  return (
    <div className="flex gap-3">
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        {isApproving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve
          </>
        )}
      </Button>

      <Button
        variant="destructive"
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        className="flex-1"
      >
        {isRejecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Rejecting...
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </>
        )}
      </Button>
    </div>
  )
}