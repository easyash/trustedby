// ===== File 2: components/dashboard/campaign-modal.tsx =====
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { X, Loader2 } from 'lucide-react'
import { createCampaign } from '@/app/(dashboard)/dashboard/campaigns/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CampaignModalProps {
  workspaceId: string
  onClose: () => void
}

export default function CampaignModal({ workspaceId, onClose }: CampaignModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Can you share your experience with us?',
    body: `Hi there!

We'd love to hear about your experience with our product/service. Your testimonial would mean the world to us and help others make informed decisions.

Could you take 2 minutes to share your thoughts?

Click here to submit your testimonial: {{LINK}}

Thank you so much!`,
    recipients: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const recipientEmails = formData.recipients
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0)

    if (recipientEmails.length === 0) {
      toast.error('Error', {
        description: 'Please add at least one recipient email',
      })
      setIsSubmitting(false)
      return
    }

    const result = await createCampaign({
      workspaceId,
      name: formData.name,
      subject: formData.subject,
      body: formData.body,
      recipients: recipientEmails,
    })

    if (result.success) {
      toast.success('Campaign Created!', {
        description: 'Your email campaign has been created successfully.',
      })
      router.refresh()
      onClose()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to create campaign',
      })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Email Campaign</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Q4 Customer Outreach"
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={10}
              required
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Use <code className="bg-gray-100 px-1 rounded">{'{{LINK}}'}</code> where you want the submission link to appear
            </p>
          </div>

          <div>
            <Label htmlFor="recipients">Recipients (one email per line)</Label>
            <Textarea
              id="recipients"
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              placeholder="customer1@example.com&#10;customer2@example.com&#10;customer3@example.com"
              rows={6}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}