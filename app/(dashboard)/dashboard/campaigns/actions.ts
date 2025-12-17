// app/(dashboard)/dashboard/campaigns/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { revalidatePath } from 'next/cache'

interface CreateCampaignParams {
  workspaceId: string
  name: string
  subject: string
  body: string
  recipients: string[]
}

export async function createCampaign(params: CreateCampaignParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify workspace ownership
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('customer_id')
      .eq('id', params.workspaceId)
      .single()

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!workspace || workspace.customer_id !== customer?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        workspace_id: params.workspaceId,
        name: params.name,
        subject: params.subject,
        body: params.body,
        recipients: params.recipients as any, // Cast to any for JSONB
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/campaigns')
    return { success: true, campaign }
  } catch (error) {
    console.error('Create campaign error:', error)
    return { success: false, error: 'Failed to create campaign' }
  }
}

export async function sendCampaign(campaignId: string, collectionLink: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, workspaces!inner(customer_id, name)')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    // Verify ownership
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, name')
      .eq('id', user.id)
      .single()

    if (campaign.workspaces.customer_id !== customer?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (campaign.status !== 'draft') {
      return { success: false, error: 'Campaign already sent' }
    }

    // Update status to sending
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId)

    // Parse recipients with type safety
    let recipientEmails: string[] = []
    
    if (Array.isArray(campaign.recipients)) {
      recipientEmails = campaign.recipients
        .map(r => typeof r === 'string' ? r : String(r))
        .filter(email => email && email !== 'null' && email !== 'undefined' && email.includes('@'))
    }

    if (recipientEmails.length === 0) {
      await supabase
        .from('email_campaigns')
        .update({ status: 'draft' })
        .eq('id', campaignId)
      return { success: false, error: 'No valid recipients found' }
    }

    // Send emails
    let sentCount = 0
    const errors: string[] = []

    for (const email of recipientEmails) {
      try {
        // Create campaign-specific tracking link with email
        const trackingLink = `${collectionLink}?campaign_id=${campaignId}&email=${encodeURIComponent(email)}`
        const personalizedBody = campaign.body.replace(/\{\{LINK\}\}/g, trackingLink)
        
        const emailResult = await sendEmail({
          to: email,
          subject: campaign.subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="white-space: pre-wrap; line-height: 1.6;">
                ${personalizedBody.split('\n').map(line => 
                  line.includes('http') 
                    ? `<a href="${line.trim()}" style="color: #3b82f6; text-decoration: none;">${line.trim()}</a>`
                    : line
                ).join('<br>')}
              </div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This email was sent from ${campaign.workspaces.name} via TrustedBy
              </p>
            </div>
          `,
        })

        if (emailResult.success) {
          sentCount++
        } else {
          errors.push(`${email}: ${emailResult.error}`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        errors.push(`${email}: ${error}`)
      }
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_count: sentCount,
        sent_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    revalidatePath('/dashboard/campaigns')

    if (errors.length > 0) {
      console.error('Email sending errors:', errors)
    }

    return { 
      success: true, 
      sent_count: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    console.error('Send campaign error:', error)
    
    // Revert status to draft on error
    const supabase = await createClient()
    await supabase
      .from('email_campaigns')
      .update({ status: 'draft' })
      .eq('id', campaignId)

    return { success: false, error: 'Failed to send campaign' }
  }
}