// components/dashboard/campaign-list.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Send, Users, CheckCircle } from 'lucide-react'
import { sendCampaign } from '@/app/(dashboard)/dashboard/campaigns/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  recipients: any
  sent_count: number
  response_count: number
  status: string
  created_at: string
  sent_at: string | null
}

interface CampaignListProps {
  campaigns: Campaign[]
  workspaceId: string
  collectionLink: string
}

export default function CampaignList({ campaigns, workspaceId, collectionLink }: CampaignListProps) {
  const router = useRouter()
  const [sendingId, setSendingId] = useState<string | null>(null)

  const handleSend = async (campaignId: string) => {
    setSendingId(campaignId)
    const result = await sendCampaign(campaignId, collectionLink)

    if (result.success) {
      toast.success('Campaign Sent!', {
        description: `Emails sent to ${result.sent_count} recipients`,
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to send campaign',
      })
    }
    setSendingId(null)
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No campaigns yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first email campaign to start collecting testimonials
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const recipientCount = Array.isArray(campaign.recipients) 
          ? campaign.recipients.length 
          : 0
        const sentCount = campaign.sent_count ?? 0
        const responseCount = campaign.response_count ?? 0
        const responseRate = sentCount > 0 
          ? ((responseCount / sentCount) * 100).toFixed(1)
          : '0.0'

        return (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{campaign.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {campaign.subject}
                  </CardDescription>
                </div>
                <Badge variant={
                  campaign.status === 'sent' ? 'default' :
                  campaign.status === 'draft' ? 'secondary' : 'outline'
                }>
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{recipientCount}</p>
                    <p className="text-xs text-gray-500">Recipients</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{sentCount}</p>
                    <p className="text-xs text-gray-500">Sent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {responseCount} ({responseRate}%)
                    </p>
                    <p className="text-xs text-gray-500">Responses</p>
                  </div>
                </div>
              </div>

              {campaign.status === 'draft' && (
                <Button 
                  onClick={() => handleSend(campaign.id)}
                  disabled={sendingId === campaign.id}
                  className="w-full"
                >
                  {sendingId === campaign.id ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Campaign to {recipientCount} Recipients
                    </>
                  )}
                </Button>
              )}

              {campaign.sent_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Sent on {new Date(campaign.sent_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}