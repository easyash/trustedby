// app/(dashboard)/dashboard/settings/actions.ts
// Server actions for settings

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const workspaceSettingsSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  brand_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
})

const profileSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export async function updateWorkspaceSettings(workspaceId: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Parse and validate
    const rawData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      website_url: formData.get('website_url') as string,
      brand_color: formData.get('brand_color') as string,
    }

    const validated = workspaceSettingsSchema.parse(rawData)

    // Check if workspace belongs to user
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('customer_id')
      .eq('id', workspaceId)
      .single()

    if (!workspace || workspace.customer_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if slug is already taken (by another workspace)
    const { data: existingSlug } = await supabase
      .from('workspaces')
      .select('id')
      .eq('slug', validated.slug)
      .neq('id', workspaceId)
      .single()

    if (existingSlug) {
      return { success: false, error: 'This slug is already taken. Please choose another.' }
    }

    // Update workspace
    const { error } = await supabase
      .from('workspaces')
      .update({
        name: validated.name,
        slug: validated.slug,
        website_url: validated.website_url || null,
        brand_color: validated.brand_color,
      })
      .eq('id', workspaceId)

    if (error) throw error

    // Revalidate relevant pages
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    revalidatePath(`/w/${validated.slug}`)

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating workspace settings:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to update settings'
    return { success: false, error: errorMessage }
  }
}

export async function updateProfileSettings(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Parse and validate
    const rawData = {
      name: formData.get('name') as string,
    }

    const validated = profileSettingsSchema.parse(rawData)

    // Update customer
    const { error } = await supabase
      .from('customers')
      .update({
        name: validated.name,
      })
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/settings')

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating profile:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
    return { success: false, error: errorMessage }
  }
}

// Add this to app/(dashboard)/dashboard/settings/actions.ts

export async function uploadLogo(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const file = formData.get('file') as File
    const workspaceId = formData.get('workspaceId') as string

    if (!file || !workspaceId) {
      return { success: false, error: 'Missing file or workspace ID' }
    }

    // Verify ownership
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('customer_id')
      .eq('id', workspaceId)
      .single()

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!workspace || workspace.customer_id !== customer?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${workspaceId}-${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('trustedby-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('trustedby-uploads')
      .getPublicUrl(filePath)

    // Update workspace with logo URL
    const { error: updateError } = await supabase
      .from('workspaces')
      .update({ logo_url: publicUrl })
      .eq('id', workspaceId)

    if (updateError) throw updateError

    revalidatePath('/dashboard/settings')
    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Upload logo error:', error)
    return { success: false, error: 'Failed to upload logo' }
  }
}