import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://naked-glados.com/api'

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
  login: (email: string, masterPin?: string) => Promise<void>
  register: (email: string, masterPin?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const getToken = useCallback(() => localStorage.getItem('token'), [])

  const parseToken = useCallback((token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return { id: payload.sub, email: payload.email, role: payload.role, permissions: payload.permissions || [], scope: payload.scope }
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    const token = getToken()
    if (token) {
      const u = parseToken(token)
      if (u) setUser(u)
    }
    setLoading(false)
  }, [getToken, parseToken])

  const login = async (email: string, masterPin?: string) => {
    const optionsRes = await fetch(`${API_BASE}/auth/login/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!optionsRes.ok) throw new Error('Login options failed')
    const options = await optionsRes.json()

    const assertion = await startAuthentication({ optionsJSON: options })

    const verifyRes = await fetch(`${API_BASE}/auth/login/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, response: assertion, masterPin }),
    })
    if (!verifyRes.ok) {
      const err = await verifyRes.json()
      throw new Error(err.error || 'Verification failed')
    }
    const { token } = await verifyRes.json()
    localStorage.setItem('token', token)
    setUser(parseToken(token))
  }

  const register = async (email: string, masterPin?: string) => {
    const optionsRes = await fetch(`${API_BASE}/auth/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!optionsRes.ok) {
      const err = await optionsRes.json()
      throw new Error(err.error || 'Registration options failed')
    }
    const options = await optionsRes.json()

    const attestation = await startRegistration({ optionsJSON: options })

    const verifyRes = await fetch(`${API_BASE}/auth/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, response: attestation, masterPin }),
    })
    if (!verifyRes.ok) {
      const err = await verifyRes.json()
      throw new Error(err.error || 'Verification failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
