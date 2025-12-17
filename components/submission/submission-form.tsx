// components/submission/submission-form.tsx
// Updated with campaign tracking AND avatar upload

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2, Send } from 'lucide-react'
import { submitTestimonial } from '@/app/submit/[linkId]/actions'
import { toast } from 'sonner'
import AvatarUploader from './avatar-uploader'

interface SubmissionFormProps {
  linkId: string
  workspaceName: string
  brandColor?: string
  campaignId?: string
  campaignEmail?: string
}

export default function SubmissionForm({ 
  linkId, 
  workspaceName, 
  brandColor = '#3b82f6',
  campaignId,
  campaignEmail,
}: SubmissionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: campaignEmail || '', // Pre-fill if from campaign
    authorTitle: '',
    authorCompany: '',
    content: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.content.trim()) {
      toast.error('Error', {
        description: 'Please write your testimonial',
      })
      return
    }

    if (formData.content.length < 10) {
      toast.error('Error', {
        description: 'Testimonial must be at least 10 characters',
      })
      return
    }

    setIsSubmitting(true)

    // Get browser info for analytics
    const ipAddress = '' // Can't get on client side
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''

    const result = await submitTestimonial({
      linkId,
      campaignId,
      campaignEmail,
      authorName: formData.authorName || 'Anonymous',
      authorEmail: formData.authorEmail || undefined,
      authorTitle: formData.authorTitle || undefined,
      authorCompany: formData.authorCompany || undefined,
      authorAvatarUrl: avatarUrl || undefined, // NEW: Include avatar
      content: formData.content,
      rating: rating || undefined,
      ipAddress,
      userAgent,
    })

    if (result.success) {
      router.push(`/submit/${linkId}/success`)
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to submit testimonial',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>How would you rate your experience? (Optional)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Testimonial Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Your Testimonial <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={`Share your experience with ${workspaceName}...`}
              rows={6}
              required
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              {formData.content.length}/2000 characters
            </p>
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              placeholder="John Doe"
            />
            <p className="text-xs text-gray-500">
              Leave blank to submit anonymously
            </p>
          </div>

          {/* Author Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Your Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.authorEmail}
              onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
              placeholder="john@example.com"
              disabled={!!campaignEmail} // Disable if pre-filled from campaign
            />
            {campaignEmail && (
              <p className="text-xs text-gray-500">
                Email pre-filled from campaign
              </p>
            )}
          </div>

          {/* Avatar Upload - NEW SECTION */}
          <div className="space-y-2">
            <Label>Your Photo (Optional)</Label>
            <AvatarUploader onUpload={setAvatarUrl} />
            <p className="text-xs text-gray-500">
              Add a photo to make your testimonial more personal
            </p>
          </div>

          {/* Author Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Your Title (Optional)</Label>
            <Input
              id="title"
              value={formData.authorTitle}
              onChange={(e) => setFormData({ ...formData, authorTitle: e.target.value })}
              placeholder="CEO, Marketing Director, etc."
            />
          </div>

          {/* Author Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Your Company (Optional)</Label>
            <Input
              id="company"
              value={formData.authorCompany}
              onChange={(e) => setFormData({ ...formData, authorCompany: e.target.value })}
              placeholder="Acme Inc."
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-lg"
            style={{ backgroundColor: brandColor }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Testimonial
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your testimonial will be reviewed before being published
          </p>
        </form>
      </CardContent>
    </Card>
  )
}