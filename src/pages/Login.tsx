export function Login() {
  return (
    <div className="login-container">
      <div className="login-card" style={{ borderColor: 'var(--danger)' }}>
        <h1 style={{ color: 'var(--danger)' }}>ACCESS DENIED</h1>
        <p>This module can only be accessed via the Aperture Dashboard.</p>
        <button className="btn btn-primary" onClick={() => window.location.href = 'https://naked-glados.com'} style={{ marginTop: '20px' }}>
          Return to Dashboard
        </button>
      </div>
    </div>
  )
}
