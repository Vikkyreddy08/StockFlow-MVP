import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.js'
import LoadingScreen from './LoadingScreen.jsx'

// Layout route for pages only unauthenticated users should see (login,
// signup). Already authenticated visitors are sent back to the app root.

export default function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
