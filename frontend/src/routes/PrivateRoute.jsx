import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function PrivateRoute() {
  const { usuario } = useAuth()
  return usuario ? <Outlet /> : <Navigate to="/login" replace />
}

export function AdminRoute() {
  const { usuario, isAdmin } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
