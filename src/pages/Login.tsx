import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [masterPin, setMasterPin] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, masterPin || undefined)
        setError('Registration successful! Now login.')
        setIsRegister(false)
      } else {
        await login(email, masterPin || undefined)
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CS2 Control</h1>
        <p>{isRegister ? 'Register a new uplink' : 'Authenticate to access CS2 server'}</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Master PIN (if required)"
            value={masterPin}
            onChange={e => setMasterPin(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '0.8rem' }}>
          {isRegister ? (
            <>Already have an uplink? <a href="#" onClick={() => setIsRegister(false)} style={{ color: 'var(--accent)' }}>Login</a></>
          ) : (
            <>Need access? <a href="#" onClick={() => setIsRegister(true)} style={{ color: 'var(--accent)' }}>Request uplink</a></>
          )}
        </p>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  )
}
