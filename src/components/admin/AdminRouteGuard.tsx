// Admin Route Guard
// Redirects to /admin/login if not authenticated

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useBusiness } from '../../providers/BusinessProvider'
import { Loading } from '../ui/Loading'

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuthContext()
  const { loading: businessLoading } = useBusiness()

  useEffect(() => {
    if (loading || businessLoading) return

    if (!user) {
      navigate('/admin/login', {
        state: { from: location },
        replace: true,
      })
    }
  }, [user, loading, businessLoading, navigate, location])

  if (loading || businessLoading) {
    return <Loading />
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
