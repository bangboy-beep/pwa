import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../types/database'

function createClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'SmartQR: Missing Supabase environment variables. ' +
      'Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}

export { createClient }
export const supabase = createClient()
