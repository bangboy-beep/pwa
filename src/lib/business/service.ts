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
  const userEmail = user.data.user?.email

  if (!userId) return { data: [], error: null }

  // 1. Jika akun menggunakan format <slug>@smartqr.app, pastikan membership terhubung
  if (userEmail && userEmail.endsWith('@smartqr.app')) {
    try {
      await (supabase as any).rpc('ensure_my_business_membership')
    } catch {
      // Abaikan jika RPC belum dieksekusi di database
    }
  }

  // 2. Query dari tabel business_members
  const { data, error } = await supabase
    .from('business_members')
    .select(`
      role,
      businesses (
        id, name, slug, business_type, logo_url, cover_url,
        description, address, phone, whatsapp,
        google_maps_url, google_review_url,
        instagram_url, facebook_url, tiktok_url, website_url,
        opening_hours, theme, status, trial_ends_at, subscription_tier, subscription_ends_at, created_at, updated_at
      )
    `)
    .eq('user_id', userId)

  const list: BusinessWithMember[] = (data ?? [])
    .filter((m: any) => m.businesses)
    .map((m: any) => ({
      ...m.businesses,
      role: m.role as UserRole,
    }))

  if (list.length > 0) {
    return { data: list, error: null }
  }

  // 3. Fallback cerdas: Jika belum ada di business_members tapi emailnya <slug>@smartqr.app
  // Langsung ambil bisnis berdasarkan slug agar tidak terlempar ke /onboarding
  if (userEmail && userEmail.endsWith('@smartqr.app')) {
    const slug = userEmail.replace('@smartqr.app', '')
    const { data: directBiz } = await (supabase.from('businesses') as any)
      .select('id, name, slug, business_type, logo_url, cover_url, description, address, phone, whatsapp, google_maps_url, google_review_url, instagram_url, facebook_url, tiktok_url, website_url, opening_hours, theme, status, trial_ends_at, subscription_tier, subscription_ends_at, created_at, updated_at')
      .eq('slug', slug)
      .maybeSingle()

    if (directBiz) {
      const biz = directBiz as Business
      // Usahakan insert membership di background
      try {
        await (supabase.from('business_members') as any).upsert(
          {
            business_id: biz.id,
            user_id: userId,
            role: 'owner',
          },
          { onConflict: 'business_id,user_id' }
        )
      } catch {
        // Abaikan jika dibatasi RLS
      }

      return {
        data: [{ ...biz, role: 'owner' as UserRole }],
        error: null,
      }
    }
  }

  return {
    data: [],
    error: error ? { message: error.message } : null,
  }
}

export async function getBusinessBySlug(slug: string): Promise<{
  data: Business | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, business_type, logo_url, cover_url, description, address, phone, whatsapp, google_maps_url, google_review_url, instagram_url, facebook_url, tiktok_url, website_url, opening_hours, theme, status, trial_ends_at, subscription_tier, subscription_ends_at, created_at, updated_at')
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
    .select('id, name, slug, business_type, logo_url, cover_url, description, status, trial_ends_at, subscription_tier, subscription_ends_at')
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
    .select('id, name, slug, business_type, logo_url, cover_url, description, address, phone, whatsapp, google_maps_url, google_review_url, instagram_url, facebook_url, tiktok_url, website_url, opening_hours, theme, status, trial_ends_at, subscription_tier, subscription_ends_at, created_at, updated_at')
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
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await (supabase.from('businesses') as any)
    .insert({
      name: input.name,
      slug: input.slug,
      business_type: input.business_type,
      status: 'active',
      subscription_tier: 'trial',
      trial_ends_at: trialEndsAt,
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

  // 1. Create Business with 14-day trial
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: businessData, error: bizError } = await (supabase.from('businesses') as any)
    .insert({
      name: input.name,
      slug: input.slug,
      business_type: input.business_type,
      status: 'active',
      subscription_tier: 'trial',
      trial_ends_at: trialEndsAt,
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

/**
 * Self-registration from Landing Page for clients with instant auto-login
 */
export async function registerBusinessSelfServe(input: {
  name: string
  slug: string
  business_type: string
  whatsapp?: string
  pin: string
}): Promise<{
  data: Business | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const cleanSlug = input.slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const ownerEmail = `${cleanSlug}@smartqr.app`
  const ownerPin = input.pin.trim()

  // Call the SECURITY DEFINER RPC (bypasses RLS safely)
  try {
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc('register_business_self_serve', {
      p_name: input.name.trim(),
      p_slug: cleanSlug,
      p_business_type: input.business_type,
      p_whatsapp: input.whatsapp?.trim() || null,
      p_pin: ownerPin,
    })

    if (rpcError) {
      return { data: null, error: { message: rpcError.message || 'Gagal mendaftar bisnis' } }
    }

    if (rpcData) {
      // Auto login with new credentials
      try {
        await supabase.auth.signInWithPassword({
          email: ownerEmail,
          password: ownerPin,
        })
      } catch {
        // ignore login error
      }
      return { data: rpcData as Business, error: null }
    }

    return { data: null, error: { message: 'Gagal membuat bisnis' } }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { data: null, error: { message: msg } }
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

export async function deleteBusiness(
  businessId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId)

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus bisnis'
    return { success: false, error: msg }
  }
}

