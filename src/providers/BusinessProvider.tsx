// SmartQR Business Context Hook Update
// Ensures proper typing and error management for multi-tenant business context

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import React from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { getMyBusinesses, type BusinessWithMember } from '../lib/business/service'
import { isSuperAdmin } from '../lib/config/admin'
import { createClient } from '../lib/supabase/client'
import type { UserRole } from '../types'

const SELECTED_BIZ_KEY = 'smartqr_selected_business_id'

interface BusinessContextType {
  businesses: BusinessWithMember[]
  selectedBusiness: BusinessWithMember | null
  setSelectedBusiness: (business: BusinessWithMember | null) => void
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextType | null>(null)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext()
  const [businesses, setBusinesses] = useState<BusinessWithMember[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lastFetchedUserIdRef = useRef<string | null>(null)

  const persistSelectedId = (biz: BusinessWithMember | null) => {
    if (biz) {
      sessionStorage.setItem(SELECTED_BIZ_KEY, biz.id)
    } else {
      sessionStorage.removeItem(SELECTED_BIZ_KEY)
    }
  }

  const setSelectedAndPersist = useCallback((biz: BusinessWithMember | null) => {
    setSelectedBusiness(biz)
    persistSelectedId(biz)
  }, [])

  const fetchBusinesses = useCallback(async () => {
    // While auth is still loading, keep loading=true so guards don't redirect
    if (authLoading) {
      return
    }

    // While user is null (auth resolved but no session), keep loading=true
    // This prevents useAuthGuard from seeing loading=false with businesses=[]
    if (!user) {
      setBusinesses([])
      setError(null)
      setLoading(false)
      return
    }

    // Avoid re-fetching if we already have data for this user
    if (lastFetchedUserIdRef.current === user.id && businesses.length > 0) {
      return
    }

    setLoading(true)
    setError(null)

    let list: BusinessWithMember[] = []
    const isSuper = await isSuperAdmin(user.email)

    if (isSuper) {
      const supabase = createClient()
      const { data: allBiz, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError('Failed to load businesses. Please try again.')
        setBusinesses([])
        setLoading(false)
        return
      }

      list = (allBiz || []).map((b: any) => ({
        ...b,
        role: 'owner' as UserRole,
      }))
    } else {
      const { data, error: fetchError } = await getMyBusinesses()

      if (fetchError) {
        setError('Failed to load businesses. Please try again.')
        setBusinesses([])
        setLoading(false)
        return
      }

      list = data || []
    }

    setBusinesses(list)
    lastFetchedUserIdRef.current = user.id

    if (list.length === 0) {
      setSelectedAndPersist(null)
      setLoading(false)
      return
    }

    const persistedId = sessionStorage.getItem(SELECTED_BIZ_KEY)
    const persisted = list.find((b) => b.id === persistedId)
    if (persisted) {
      setSelectedAndPersist(persisted)
    } else if (!selectedBusiness) {
      setSelectedAndPersist(list[0])
    } else if (list.find((b) => b.id === selectedBusiness.id)) {
      persistSelectedId(selectedBusiness)
    } else {
      setSelectedAndPersist(list[0])
    }

    setLoading(false)
  }, [user, authLoading, businesses.length, selectedBusiness, setSelectedAndPersist])

  useEffect(() => {
    fetchBusinesses()
  }, [user?.id, fetchBusinesses])

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        selectedBusiness,
        setSelectedBusiness: setSelectedAndPersist,
        loading: authLoading || loading,
        error,
        refetch: fetchBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
