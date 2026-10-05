// SmartQR Auth Hook
// Provides authentication state and methods
// Re-exported from AuthProvider to avoid circular dependencies
export type { User } from '@supabase/supabase-js'

export interface AuthState {
  user: null | {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown>
  }
  loading: boolean
}
