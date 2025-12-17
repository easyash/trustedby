// lib/email/send.ts
// Helper functions to send emails

import { resend } from './resend'
import TestimonialSubmittedEmail from './templates/testimonial-submitted'
import TestimonialApprovedEmail from './templates/testimonial-approved'

export async function sendTestimonialNotification({
  to,
  workspaceName,
  authorName,
  content,
  moderationUrl,
}: {
  to: string
  workspaceName: string
  authorName: string
  content: string
  moderationUrl: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: `New testimonial submitted for ${workspaceName}`,
      react: TestimonialSubmittedEmail({
        workspaceName,
        authorName,
        content: content.substring(0, 200), // Truncate for email
        moderationUrl,
      }),
    })

    if (error) {
      console.error('Error sending testimonial notification:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending testimonial notification:', error)
    return { success: false, error }
  }
}

export async function sendApprovalNotification({
  to,
  workspaceName,
  authorName,
  publicPageUrl,
}: {
  to: string
  workspaceName: string
  authorName: string
  publicPageUrl: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: `Your testimonial for ${workspaceName} is now live!`,
      react: TestimonialApprovedEmail({
        workspaceName,
        authorName,
        publicPageUrl,
      }),
    })

    if (error) {
      console.error('Error sending approval notification:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending approval notification:', error)
    return { success: false, error }
  }
}

// Generic email sending function for campaigns
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject,
      html: html || text || '',
      text,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}