// SmartQR Auth Guard Hook
// Redirects unauthenticated users to login
// Redirects authenticated users without businesses to onboarding

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from './useAuthContext'
import { useBusiness } from '../providers/BusinessProvider'

export function useAuthGuard(redirectToOnboarding = true) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthContext()
  const { businesses, loading: businessLoading } = useBusiness()

  // businessLoading already includes authLoading (| authLoading || loading)
  const isLoading = businessLoading

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user) {
      // Redirect to admin login, preserving intended destination
      navigate('/admin/login', {
        state: { from: location },
        replace: true,
      })
      return
    }

    if (redirectToOnboarding && businesses.length === 0) {
      navigate('/onboarding', { replace: true })
    }
  }, [user, isLoading, businesses, navigate, location, redirectToOnboarding])

  return { isAuthenticated: !!user, isLoading }
}
