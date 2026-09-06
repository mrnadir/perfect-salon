import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ADMIN, getSession, saveSession } from '../lib/session'
import type { AdminSession } from '../types'

interface AuthContextValue {
  session: AdminSession | null
  login: (username: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => getSession())

  const login = useCallback((username: string, password: string) => {
    if (
      username.trim().toLowerCase() !== ADMIN.username ||
      password !== ADMIN.password
    ) {
      return 'Invalid username or password'
    }
    const next: AdminSession = {
      username: ADMIN.username,
      loggedInAt: new Date().toISOString(),
    }
    saveSession(next)
    setSession(next)
    return null
  }, [])

  const logout = useCallback(() => {
    saveSession(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
