import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../types/database'

function createClient() {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'SmartQR: Missing Supabase environment variables. ' +
      'Connect the Supabase integration or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }

  // Placeholders keep the app from crashing on load before Supabase is configured;
  // requests will simply fail until real credentials are provided.
  return createBrowserClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  )
}

export { createClient }
export const supabase = createClient()
