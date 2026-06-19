import { useState, useEffect } from 'react'
import { createContext, useContext } from 'react'

const API_BASE = (import.meta as unknown as { env: { VITE_API_BASE: string } }).env.VITE_API_BASE || 'https://naked-glados.com/api'

interface User {
  id: string
  email: string
  role: string
  permissions: string[]
  scope: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ?? null
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token)
  if (!exp) return false
  return Date.now() / 1000 > exp
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      // Read token from hash fragment first (backend sends #auth_token=), then query param fallback
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const queryParams = new URLSearchParams(window.location.search)
      const urlToken = hashParams.get('auth_token') || queryParams.get('auth_token') || queryParams.get('token')
      const storedToken = localStorage.getItem('token')
      const token = urlToken || storedToken

      if (!token) {
        setLoading(false)
        return
      }

      // For stored tokens, do a quick client-side expiry check before hitting the network.
      // Skip for fresh URL tokens — server validation below is the authoritative check.
      if (!urlToken && isTokenExpired(token)) {
        localStorage.removeItem('token')
        localStorage.removeItem('glados_token')
        setLoading(false)
        return
      }

      try {
        // Persist first so api.ts picks it up for subsequent calls
        localStorage.setItem('token', token)
        localStorage.setItem('glados_token', token)

        // Validate token server-side
        const res = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Token rejected by server')

        const data = await res.json()
        // Scope lives in the JWT payload, not the DB row
        const scope = getTokenExpiry(token) !== null
          ? (() => { try { return JSON.parse(atob(token.split('.')[1])).scope || '' } catch { return '' } })()
          : ''

        setUser({ id: data.id, email: data.email, role: data.role, permissions: data.permissions || [], scope })

        // Remove token from URL bar after consuming it
        if (urlToken) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('glados_token')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('glados_token')
    setUser(null)
    window.location.href = 'https://naked-glados.com'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
