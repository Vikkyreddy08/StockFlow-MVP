import { createContext, useContext } from 'react'

// Shared auth context. Kept in its own module (no component exports) so the
// provider file stays fast-refresh friendly.
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
