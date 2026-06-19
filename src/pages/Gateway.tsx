import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Gateway() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, user, navigate])

  if (!loading && !user) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ borderColor: 'var(--danger)' }}>
          <h1 style={{ color: 'var(--danger)' }}>ACCESS DENIED</h1>
          <p>Unauthorized entry point. Please establish a secure uplink via the Aperture Dashboard.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = 'https://naked-glados.com'} style={{ marginTop: '20px' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CS2 Control</h1>
        <p>Establishing secure gateway...</p>
        <div className="spinner" style={{ margin: '20px auto', width: '30px', height: '30px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  )
}
