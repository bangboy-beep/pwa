// SmartQR Business Service
// Handles all business-related Supabase queries

import { createClient } from '../supabase/client'
import type { Business, BusinessMember, UserRole, BusinessType, BusinessStatus } from '../../types'

export interface BusinessWithMember extends Business {
  role: UserRole
}

export interface PublicBusiness {
  id: string
  name: string
  slug: string
  business_type: BusinessType
  logo_url?: string
  cover_url?: string
  description?: string
  status: BusinessStatus
}

export async function getMyBusinesses(): Promise<{
  data: BusinessWithMember[]
  error: { message: string } | null
}> {
  const supabase = createClient()
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id

  if (!userId) return { data: [], error: null }

  const { data, error } = await supabase
    .from('business_members')
    .select(`
      role,
      businesses (
        id, name, slug, business_type, logo_url, cover_url,
        description, address, phone, whatsapp,
        google_maps_url, google_review_url,
        instagram_url, facebook_url, tiktok_url, website_url,
        opening_hours, theme, status, created_at, updated_at
      )
    `)
    .eq('user_id', userId)

  if (error) return { data: [], error: null }

  return {
    data: (data ?? []).map((m: any) => ({
      ...m.businesses,
      role: m.role as UserRole,
    })),
    error: null,
  }
}

export async function getBusinessBySlug(slug: string): Promise<{
  data: Business | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, business_type, logo_url, cover_url, description, address, phone, whatsapp, google_maps_url, google_review_url, instagram_url, facebook_url, tiktok_url, website_url, opening_hours, theme, status, created_at, updated_at')
    .eq('slug', slug)
    .single()

  return { data: data as unknown as Business | null, error }
}

export async function getPublicBusinessBySlug(slug: string): Promise<{
  data: PublicBusiness | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, business_type, logo_url, cover_url, description, status')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  return { data: data as PublicBusiness | null, error }
}

export async function getBusinessById(id: string): Promise<{
  data: Business | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, business_type, logo_url, cover_url, description, address, phone, whatsapp, google_maps_url, google_review_url, instagram_url, facebook_url, tiktok_url, website_url, opening_hours, theme, status, created_at, updated_at')
    .eq('id', id)
    .single()

  return { data: data as unknown as Business | null, error }
}

export async function createBusiness(input: {
  name: string
  slug: string
  business_type: string
}): Promise<{
  data: Business | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('businesses') as any)
    .insert({
      name: input.name,
      slug: input.slug,
      business_type: input.business_type,
      status: 'active',
    })
    .select()
    .single()

  return { data: data as unknown as Business | null, error }
}

export async function updateBusiness(
  id: string,
  updates: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>
): Promise<{
  data: Business | null
  error: { message: string } | null
}> {
  const supabase = createClient()

  // Defense-in-depth: verify caller has membership AND is owner/admin role.
  // RLS already enforces this at the database level, but we double-check here
  // in the application layer to fail fast and avoid unnecessary query attempts.
  const { data: role } = await (supabase as any).rpc('get_business_role', { p_business_id: id })
  if (role !== 'owner' && role !== 'admin') {
    return { data: null, error: { message: 'Access denied: owner or admin role required' } }
  }

  const { data, error } = await (supabase.from('businesses') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as unknown as Business | null, error }
}

export async function addBusinessMember(
  businessId: string,
  userId: string,
  role: UserRole
): Promise<{
  data: BusinessMember | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('business_members') as any)
    .insert({
      business_id: businessId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  return { data: data as unknown as BusinessMember | null, error }
}

export async function removeBusinessMember(
  businessId: string,
  memberId: string
): Promise<{ error: { message: string } | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('business_members')
    .delete()
    .eq('id', memberId)
    .eq('business_id', businessId)

  return { error }
}
