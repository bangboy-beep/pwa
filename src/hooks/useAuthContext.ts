// SmartQR Authentication Context & Hook
import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import React from 'react'
import { createClient } from '../lib/supabase/client'

interface AuthContextType {
  user: null | {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown>
  }
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<unknown>
  resendConfirmation: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    // Initialize authentication state
    const initializeAuth = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth getSession error:', error)
        }

        if (!mounted) return

        setUser(
          data.session?.user
            ? {
                id: data.session.user.id,
                email: data.session.user.email,
                user_metadata: data.session.user.user_metadata,
              }
            : null
        )

        setLoading(false)
      } catch (error) {
        console.error('Auth initialization error:', error)

        if (!mounted) return

        setUser(null)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              user_metadata: session.user.user_metadata,
            }
          : null
      )

      setLoading(false)
    })

    // Cleanup
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  }

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        signIn,
        signUp,
        resendConfirmation,
        signOut,
      },
    },
    children
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}