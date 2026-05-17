import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface ServerStatus {
  online: boolean
  players?: number
  maxPlayers?: number
  map?: string
  pod?: { running: boolean; phase: string }
}

export function Dashboard() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const data = await api<ServerStatus>('/status')
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

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>CS2 Server Overview</p>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-value" style={{ color: status?.online ? 'var(--success)' : 'var(--danger)' }}>
            {status?.online ? 'Online' : 'Offline'}
          </div>
          <div className="stat-label">Server Status</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{status?.players ?? 0}/{status?.maxPlayers ?? 0}</div>
          <div className="stat-label">Players</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>{status?.map || 'N/A'}</div>
          <div className="stat-label">Current Map</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1rem', color: status?.pod?.running ? 'var(--success)' : 'var(--danger)' }}>
            {status?.pod?.phase || 'N/A'}
          </div>
          <div className="stat-label">Pod Status</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/console" className="btn btn-primary">Open Console</a>
          <a href="/players" className="btn btn-secondary">View Players</a>
          <a href="/maps" className="btn btn-secondary">Change Map</a>
          <a href="/server" className="btn btn-secondary">Server Control</a>
        </div>
      </div>
    </div>
  )
}
