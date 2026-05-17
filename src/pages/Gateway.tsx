import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Gateway() {
  const navigate = useNavigate()
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('auth_token') || params.get('token')
    const storedToken = localStorage.getItem('token')
    const referrer = document.referrer
    const fromDashboard = referrer.includes('naked-glados.com') || referrer.includes('localhost')

    if (urlToken) {
      localStorage.setItem('token', urlToken)
      localStorage.setItem('glados_token', urlToken)
      window.history.replaceState({}, document.title, window.location.pathname)
      navigate('/dashboard', { replace: true })
    } else if (storedToken) {
      navigate('/dashboard', { replace: true })
    } else if (!fromDashboard) {
      setDenied(true)
    } else {
      window.location.href = 'https://naked-glados.com'
    }
  }, [navigate])

  if (denied) {
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
