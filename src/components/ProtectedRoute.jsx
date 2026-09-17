import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ adminOnly = false, blockAdmin = false }) {
  const { user, token } = useAuth()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (blockAdmin && user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
