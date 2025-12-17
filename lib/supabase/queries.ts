// lib/supabase/queries.ts
// Reusable database queries

import { createClient } from './server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return customer
}

export async function getUserWorkspaces(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getWorkspaceBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()
  
  if (error) throw error
  return data
}

export async function getWorkspaceByCollectionLink(linkId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('collection_link_id', linkId)
    .single()
  
  if (error) throw error
  return data
}

export async function getTestimonials(workspaceId: string, status?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getApprovedTestimonials(workspaceId: string, limit = 12) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getPendingTestimonials(workspaceId: string) {
  return getTestimonials(workspaceId, 'pending')
}

export async function getTestimonialStats(workspaceId: string) {
  const supabase = await createClient()
  
  const { count: totalCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
  
  const { count: approvedCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'approved')
  
  const { count: pendingCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
  
  return {
    total: totalCount || 0,
    approved: approvedCount || 0,
    pending: pendingCount || 0,
  }
}