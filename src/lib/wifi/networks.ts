import { createClient } from '../supabase/client'
import type { WiFiNetwork } from '../../types'

export async function getWifiNetworks(businessId: string): Promise<{
  data: WiFiNetwork[] | null
  error: { message: string } | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_wifi_networks')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })
  return { data: data as WiFiNetwork[] | null, error }
}

export async function createWifiNetwork(
  businessId: string,
  network: Omit<WiFiNetwork, 'id' | 'business_id' | 'created_at' | 'updated_at'>
): Promise<{ data: WiFiNetwork | null; error: { message: string } | null }> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('business_wifi_networks') as any)
    .insert({ ...network, business_id: businessId })
    .select()
    .single()
  return { data: data as WiFiNetwork | null, error }
}

export async function updateWifiNetwork(
  networkId: string,
  updates: Partial<Omit<WiFiNetwork, 'id' | 'business_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: WiFiNetwork | null; error: { message: string } | null }> {
  const supabase = createClient()
  const { data, error } = await (supabase.from('business_wifi_networks') as any)
    .update(updates)
    .eq('id', networkId)
    .select()
    .single()
  return { data: data as WiFiNetwork | null, error }
}

export async function deleteWifiNetwork(networkId: string): Promise<{ error: { message: string } | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('business_wifi_networks')
    .delete()
    .eq('id', networkId)
  return { error }
}
