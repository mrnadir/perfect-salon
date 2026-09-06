import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ManagementGuard() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/management/login" replace />
  return <Outlet />
}
