import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function ServerControl() {
  const [status, setStatus] = useState<{ online: boolean; pod?: { running: boolean; phase: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const data = await api<{ online: boolean; pod?: { running: boolean; phase: string } }>('/status')
      setStatus(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const serverAction = async (action: string, endpoint: string) => {
    if (!window.confirm(`${action} the server?`)) return
    setActionLoading(action)
    try {
      const data = await api(endpoint, { method: 'POST' })
      showToast((data as { message?: string }).message || `${action} initiated`)
      setTimeout(fetchStatus, 3000)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `${action} failed`)
    } finally {
      setActionLoading(null)
    }
  }

  const sayMessage = async () => {
    const message = prompt('Message to broadcast:')
    if (!message) return
    try {
      await api('/server/say', {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
      showToast('Message sent')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to send')
    }
  }

  const restartGame = async () => {
    if (!confirm('Restart the current game?')) return
    try {
      await api('/server/restartgame', { method: 'POST' })
      showToast('Game restarting')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Server Control</h2>
        <p>Start, stop, and manage the CS2 server</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Server Status</h3>
          <span className={`status-indicator ${status?.online ? 'status-online' : 'status-offline'}`}>
            <span className="status-dot" />
            {status?.online ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="grid grid-3" style={{ marginTop: '15px' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1rem' }}>{status?.pod?.phase || 'N/A'}</div>
            <div className="stat-label">Pod Phase</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1rem', color: status?.pod?.running ? 'var(--success)' : 'var(--danger)' }}>
              {status?.pod?.running ? 'Running' : 'Stopped'}
            </div>
            <div className="stat-label">Container</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1rem' }}>
              {status?.online ? 'Connected' : 'Disconnected'}
            </div>
            <div className="stat-label">RCON</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Power Controls</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => serverAction('Starting', '/server/start')}
            disabled={actionLoading !== null || status?.online}
          >
            {actionLoading === 'Starting' ? 'Starting...' : 'Start Server'}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => serverAction('Stopping', '/server/stop')}
            disabled={actionLoading !== null || !status?.online}
          >
            {actionLoading === 'Stopping' ? 'Stopping...' : 'Stop Server'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => serverAction('Restarting', '/server/restart')}
            disabled={actionLoading !== null}
          >
            {actionLoading === 'Restarting' ? 'Restarting...' : 'Restart Server'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Game Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={sayMessage}>
            Broadcast Message
          </button>
          <button className="btn btn-secondary" onClick={restartGame}>
            Restart Game
          </button>
        </div>
      </div>

      {toast && <div className={`toast ${toast.includes('Failed') ? 'error' : 'success'}`}>{toast}</div>}
    </div>
  )
}
