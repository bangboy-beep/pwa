import { createClient } from '../supabase/client'
import type { WiFiSettings } from '../../types'

export async function getWifiSettings(businessId: string): Promise<{
  data: WiFiSettings | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_wifi')
    .select('*')
    .eq('business_id', businessId)
    .single()

  return { data: data as WiFiSettings | null, error }
}

export async function updateWifiSettings(
  businessId: string,
  updates: Omit<WiFiSettings, 'id' | 'business_id' | 'created_at' | 'updated_at'>
): Promise<{
  data: WiFiSettings | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('business_wifi') as any)
    .upsert({
      business_id: businessId,
      ssid: updates.ssid.trim(),
      password: updates.password?.trim() || null,
      security_type: updates.security_type,
      is_active: updates.is_active,
    })
    .select()
    .single()

  return { data: data as WiFiSettings | null, error }
}
