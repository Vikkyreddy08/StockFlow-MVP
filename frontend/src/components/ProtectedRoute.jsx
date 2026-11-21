import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.js'
import LoadingScreen from './LoadingScreen.jsx'

// Layout route that protects all nested children. Unauthenticated users are
// sent to /login with the originally requested URL preserved in location
// state so LoginPage can return them there after a successful sign-in.

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return <Outlet />
}
