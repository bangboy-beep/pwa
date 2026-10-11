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

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function generateRandomPin(length = 6): string {
  const digits = '0123456789'
  let pin = ''
  for (let i = 0; i < length; i++) {
    pin += digits.charAt(Math.floor(Math.random() * digits.length))
  }
  return pin
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

export async function createBusinessWithOwner(input: {
  name: string
  slug: string
  business_type: string
  owner_email?: string
  owner_pin?: string
}): Promise<{
  data: {
    business: Business
    ownerEmail: string
    ownerPin: string
  } | null
  error: { message: string } | null
}> {
  const supabase = createClient()

  // 1. Create Business
  const { data: businessData, error: bizError } = await (supabase.from('businesses') as any)
    .insert({
      name: input.name,
      slug: input.slug,
      business_type: input.business_type,
      status: 'active',
    })
    .select()
    .single()

  if (bizError || !businessData) {
    return { data: null, error: bizError || { message: 'Gagal membuat bisnis' } }
  }

  const business = businessData as Business
  const ownerEmail = (input.owner_email && input.owner_email.trim()) || `${input.slug}@smartqr.app`
  const ownerPin = (input.owner_pin && input.owner_pin.trim()) || generateRandomPin(6)

  // 2. Register Owner Auth user via isolated client (to keep current SuperAdmin session intact)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  const isolatedClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  try {
    const { data: authData, error: authError } = await isolatedClient.auth.signUp({
      email: ownerEmail,
      password: ownerPin,
    })

    if (authError) {
      console.warn('Signup owner auth warning:', authError.message)
    } else if (authData.user) {
      // 3. Link newly created user to business as owner
      await addBusinessMember(business.id, authData.user.id, 'owner')
    }
  } catch (err) {
    console.error('Failed to create owner user:', err)
  }

  // 4. Save PIN to business_pins table so Super Admin can always view and manage it
  await setBusinessPin(business.id, ownerPin)

  return {
    data: {
      business,
      ownerEmail,
      ownerPin,
    },
    error: null,
  }
}

export async function setBusinessPin(
  businessId: string,
  newPin: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  try {
    // 1. Try RPC which updates both business_pins table and auth.users password
    const { error: rpcError } = await (supabase as any).rpc('set_business_pin', {
      p_business_id: businessId,
      p_new_pin: newPin,
    })

    if (!rpcError) {
      return { success: true, error: null }
    }

    console.warn('RPC set_business_pin notice:', rpcError.message)

    // 2. Fallback direct upsert to business_pins table
    const { error: upsertError } = await (supabase.from('business_pins') as any).upsert(
      {
        business_id: businessId,
        pin: newPin,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    )

    if (upsertError) {
      return { success: false, error: upsertError.message }
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan PIN'
    return { success: false, error: msg }
  }
}

export async function getBusinessPins(): Promise<Record<string, string>> {
  const supabase = createClient()
  try {
    const { data, error } = await (supabase.from('business_pins') as any).select('business_id, pin')
    if (error || !data) return {}
    const map: Record<string, string> = {}
    data.forEach((item: { business_id: string; pin: string }) => {
      if (item.business_id && item.pin) {
        map[item.business_id] = item.pin
      }
    })
    return map
  } catch {
    return {}
  }
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
