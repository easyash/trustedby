// app/submit/[linkId]/actions.ts
// Updated with campaign tracking

'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { revalidatePath } from 'next/cache'

interface SubmitTestimonialParams {
  linkId: string
  campaignId?: string
  campaignEmail?: string
  authorName: string
  authorEmail?: string
  authorTitle?: string
  authorCompany?: string
  authorAvatarUrl?: string
  content: string
  rating?: number
  ipAddress?: string
  userAgent?: string
}

export async function submitTestimonial(params: SubmitTestimonialParams) {
  try {
    const supabase = await createClient()

    // Find workspace by collection link
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id, customer_id, name')
      .eq('collection_link_id', params.linkId)
      .single()

    if (workspaceError || !workspace) {
      return { success: false, error: 'Invalid collection link' }
    }

    // Insert testimonial
    const { data: testimonial, error: testimonialError } = await supabase
      .from('testimonials')
      .insert({
        workspace_id: workspace.id,
        author_name: params.authorName || 'Anonymous',
        author_email: params.authorEmail,
        author_title: params.authorTitle,
        author_company: params.authorCompany,
        author_avatar_url: params.authorAvatarUrl,
        content: params.content,
        rating: params.rating,
        status: 'pending',
        collected_via: params.campaignId ? 'email' : 'link',
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
      })
      .select()
      .single()

    if (testimonialError) throw testimonialError

    // Track campaign response if campaign_id is present
    if (params.campaignId && params.campaignEmail) {
      // Insert campaign response
      await supabase
        .from('campaign_responses')
        .insert({
          campaign_id: params.campaignId,
          email: params.campaignEmail,
          testimonial_id: testimonial.id,
        })

      // Increment response count
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('response_count')
        .eq('id', params.campaignId)
        .single()

      if (campaign) {
        await supabase
          .from('email_campaigns')
          .update({ 
            response_count: (campaign.response_count ?? 0) + 1 
          })
          .eq('id', params.campaignId)
      }
    }

    // Send notification email to workspace owner
    const { data: customer } = await supabase
      .from('customers')
      .select('email, name')
      .eq('id', workspace.customer_id)
      .single()

    if (customer?.email) {
      await sendEmail({
        to: customer.email,
        subject: `New testimonial from ${params.authorName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Testimonial Received! 🎉</h2>
            <p>You've received a new testimonial for <strong>${workspace.name}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-style: italic; margin: 0;">"${params.content}"</p>
              ${params.rating ? `<p style="margin-top: 10px;">⭐ Rating: ${params.rating}/5</p>` : ''}
            </div>
            
            <p><strong>From:</strong> ${params.authorName}</p>
            ${params.authorTitle ? `<p><strong>Title:</strong> ${params.authorTitle}</p>` : ''}
            ${params.authorCompany ? `<p><strong>Company:</strong> ${params.authorCompany}</p>` : ''}
            ${params.authorEmail ? `<p><strong>Email:</strong> ${params.authorEmail}</p>` : ''}
            
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/testimonials/moderation" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review & Approve
              </a>
            </p>
          </div>
        `,
      })
    }

    revalidatePath('/dashboard/testimonials')
    revalidatePath('/dashboard/testimonials/moderation')
    
    if (params.campaignId) {
      revalidatePath('/dashboard/campaigns')
    }

    return { success: true, testimonialId: testimonial.id }
  } catch (error) {
    console.error('Submit testimonial error:', error)
    return { success: false, error: 'Failed to submit testimonial' }
  }
}