// app/(dashboard)/dashboard/testimonials/moderation/actions.ts
// Server actions for approve/reject testimonials

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendApprovalNotification } from '@/lib/email/send'

export async function approveTestimonial(testimonialId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update testimonial status
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', testimonialId)
      .select(`
        *,
        workspaces (
          id,
          name,
          slug,
          customer_id
        )
      `)
      .single()

    if (error) throw error

    // Verify user owns this workspace
    if (testimonial.workspaces.customer_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Send approval email if author provided email
    if (testimonial.author_email) {
      const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/w/${testimonial.workspaces.slug}`
      
      await sendApprovalNotification({
        to: testimonial.author_email,
        workspaceName: testimonial.workspaces.name,
        authorName: testimonial.author_name,
        publicPageUrl: publicUrl,
      })
    }

    // Revalidate pages to show updated data
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/testimonials')
    revalidatePath('/dashboard/testimonials/moderation')
    revalidatePath(`/w/${testimonial.workspaces.slug}`)

    return { success: true, testimonial }
  } catch (error: any) {
    console.error('Error approving testimonial:', error)
    return { success: false, error: error.message || 'Failed to approve testimonial' }
  }
}

export async function rejectTestimonial(testimonialId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update testimonial status
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .update({
        status: 'rejected',
      })
      .eq('id', testimonialId)
      .select(`
        *,
        workspaces (
          customer_id
        )
      `)
      .single()

    if (error) throw error

    // Verify user owns this workspace
    if (testimonial.workspaces.customer_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Revalidate pages
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/testimonials')
    revalidatePath('/dashboard/testimonials/moderation')

    return { success: true }
  } catch (error: any) {
    console.error('Error rejecting testimonial:', error)
    return { success: false, error: error.message || 'Failed to reject testimonial' }
  }
}

export async function deleteTestimonial(testimonialId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get testimonial to verify ownership
    const { data: testimonial } = await supabase
      .from('testimonials')
      .select(`
        id,
        workspaces (
          customer_id
        )
      `)
      .eq('id', testimonialId)
      .single()

    if (!testimonial || testimonial.workspaces.customer_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete testimonial
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', testimonialId)

    if (error) throw error

    // Revalidate pages
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/testimonials')
    revalidatePath('/dashboard/testimonials/moderation')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting testimonial:', error)
    return { success: false, error: error.message || 'Failed to delete testimonial' }
  }
}