import { createContext, useContext, useMemo, useState } from 'react'
import { authAPI } from '../services/api'
import { getDemoUserByEmail } from '../data/users'
import { normalizeRole, isHostRole } from '../utils/roles'

export { normalizeRole, isHostRole }

const AuthContext = createContext(null)

const SESSION_KEY = 'sr_session'

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Demo quick-login profiles surfaced on the Login page.
// Canonical roles: USER (customer), HOST (clothing provider), ADMIN.
export const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'customer@stylerent.com', password: 'customer123', role: 'USER' },
  { label: 'Host', email: 'host@stylerent.com', password: 'host123', role: 'HOST' },
  { label: 'Administrator', email: 'admin@stylerent.com', password: 'admin123', role: 'ADMIN' },
]

// Backend canonical role is HOST; 'OWNER' is kept as a legacy frontend alias
// (helpers live in utils/roles.js and are re-exported here for compatibility).

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)
  const [loading, setLoading] = useState(false)

  const persistSession = (next) => {
    if (next) {
      // Passwords are NEVER stored here — only safe user + a mock token.
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
    setSession(next)
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const result = await authAPI.login(email, password)
      // Normalize legacy OWNER role to canonical HOST.
      if (result?.user) result.user = { ...result.user, role: normalizeRole(result.user.role) }
      persistSession(result)
      return result.user
    } finally {
      setLoading(false)
    }
  }

  const loginAsDemo = async (role) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === role)
    if (!account) throw new Error('Unknown demo role.')
    return login(account.email, account.password)
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const result = await authAPI.register(payload)
      if (result?.user) result.user = { ...result.user, role: normalizeRole(result.user.role) }
      persistSession(result)
      return result.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => persistSession(null)

  const updateProfile = (patch) => {
    setSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, user: { ...prev.user, ...patch } }
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      return next
    })
    const demoUser = getDemoUserByEmail(session?.user?.email)
    if (demoUser) Object.assign(demoUser, patch)
  }

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: !!session?.user,
      role: normalizeRole(session?.user?.role || null),
      loading,
      login,
      loginAsDemo,
      register,
      logout,
      updateProfile,
      // Convenience helpers
      isUser: normalizeRole(session?.user?.role) === 'USER',
      isHost: isHostRole(session?.user?.role),
      isOwner: isHostRole(session?.user?.role),
      isAdmin: session?.user?.role === 'ADMIN',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
