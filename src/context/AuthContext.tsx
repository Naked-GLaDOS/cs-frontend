import { useState, useEffect, useCallback } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

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
  login: (email: string, masterPin?: string) => Promise<void>
  register: (email: string, masterPin?: string) => Promise<void>
  logout: () => void
}

import { createContext, useContext } from 'react'

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function parseToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub, email: payload.email, role: payload.role, permissions: payload.permissions || [], scope: payload.scope }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const processToken = useCallback((token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('glados_token', token)
    const u = parseToken(token)
    if (u) setUser(u)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('auth_token') || params.get('token')
    const storedToken = localStorage.getItem('token')
    const referrer = document.referrer
    const fromDashboard = referrer.includes('naked-glados.com') || referrer.includes('localhost')

    if (urlToken) {
      processToken(urlToken)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (storedToken) {
      const u = parseToken(storedToken)
      if (u) setUser(u)
    } else if (!fromDashboard) {
      window.location.href = 'https://naked-glados.com'
      return
    }
    setLoading(false)
  }, [processToken])

  const login = async (email: string, masterPin?: string) => {
    const optionsRes = await fetch(`${API_BASE}/auth/login/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!optionsRes.ok) throw new Error('Login options failed')
    const options = await optionsRes.json()

    const assertion = await startAuthentication(options)

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
    processToken(token)
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

    const attestation = await startRegistration(options)

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
    localStorage.removeItem('glados_token')
    setUser(null)
    window.location.href = 'https://naked-glados.com'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
