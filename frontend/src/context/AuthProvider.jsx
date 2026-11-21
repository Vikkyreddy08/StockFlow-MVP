import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMe, login as loginRequest } from '../services/auth.js'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
  subscribe,
} from '../services/tokenStorage.js'
import { AuthContext } from './AuthContext.js'

// Token storage trade-offs (why localStorage):
// - localStorage persists across refreshes, tabs and browser restarts, so the
//   session survives an application restart - which is exactly what "restore
//   the saved session on startup" requires.
// - sessionStorage is cleared when the tab closes and is not shared between
//   tabs. That gives a slightly smaller exposure window, but the session is
//   lost on restart and is not visible in a newly opened tab.
// - Neither store protects against XSS: any script running on the origin can
//   read the tokens. The real mitigations are short-lived access tokens
//   (60 min here) plus a refresh token, and never storing passwords.
// One consistent strategy (localStorage) is used everywhere, via
// services/tokenStorage.

export default function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [tokens, setTokens] = useState(() => ({
    access: getAccessToken(),
    refresh: getRefreshToken(),
  }))
  const [loading, setLoading] = useState(true)

  // Mirror storage changes (e.g. a silent token refresh) into state.
  useEffect(
    () =>
      subscribe(() => {
        setTokens({ access: getAccessToken(), refresh: getRefreshToken() })
      }),
    [],
  )

  const clearAuth = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    setSession({ access: data.access, refresh: data.refresh })
    const currentUser = await getMe()
    setUser(currentUser)
    return currentUser
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    navigate('/login', { replace: true })
  }, [clearAuth, navigate])

  // Restore the saved session once on startup.
  useEffect(() => {
    let active = true

    async function restoreSession() {
      if (!getAccessToken() && !getRefreshToken()) {
        setLoading(false)
        return
      }
      try {
        // getMe() sends the access token. If it has expired, the Axios
        // response interceptor refreshes it and retries before this resolves.
        const currentUser = await getMe()
        if (active) setUser(currentUser)
      } catch (error) {
        // Only a genuine authentication failure invalidates the session.
        // Network errors (no response) and other server errors (e.g. 500)
        // leave the stored tokens intact so the session can be retried.
        const status = error?.response?.status

        if (active && (status === 401 || status === 403)) {
          clearAuth()
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      active = false
    }
  }, [clearAuth])

  const value = {
    user,
    accessToken: tokens.access,
    refreshToken: tokens.refresh,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
