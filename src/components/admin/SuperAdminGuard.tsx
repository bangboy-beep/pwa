import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'
import { isSuperAdmin } from '../../lib/config/admin'
import { Loading } from '../ui/Loading'

export function SuperAdminGuard() {
  const { user, loading: authLoading } = useAuthContext()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function checkAdmin() {
      console.log(
        'SuperAdminGuard check:',
        user?.email,
        'authLoading:',
        authLoading
      )

      if (!user?.email) {
        if (!cancelled) setIsAdmin(false)
        return
      }

      try {
        const check = await isSuperAdmin(user.email)

        console.log('Is admin result:', check)

        if (!cancelled) {
          setIsAdmin(check)
        }
      } catch (error) {
        console.error('SuperAdminGuard error:', error)

        if (!cancelled) {
          setIsAdmin(false)
        }
      }
    }

    if (!authLoading) {
      checkAdmin()
    }

    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  if (authLoading || isAdmin === null) {
    return <Loading />
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}