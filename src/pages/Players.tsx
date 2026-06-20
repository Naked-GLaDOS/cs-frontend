import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface Player {
  id: number
  name: string
  steamId: string
  score: number
  time: string
}

const PAGE_SIZE = 20

export function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const fetchPlayers = async () => {
    try {
      const data = await api<{ players: Player[]; count: number }>('/players')
      setPlayers(data.players)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
    const interval = setInterval(fetchPlayers, 15000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const kickPlayer = async (userId: number, name: string) => {
    if (!window.confirm(`Kick player ${name}?`)) return
    const reason = prompt('Kick reason (optional):')
    try {
      await api(`/players/${userId}/kick`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || undefined }),
      })
      showToast(`Player kicked`)
      fetchPlayers()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to kick')
    }
  }

  const banPlayer = async (userId: number, name: string) => {
    if (!window.confirm(`Ban player ${name}?`)) return
    const duration = prompt('Ban duration in minutes (0 = permanent):', '0')
    if (duration === null) return
    const reason = prompt('Ban reason (optional):')
    try {
      await api(`/players/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ duration: parseInt(duration) || 0, reason: reason || undefined }),
      })
      showToast(`Player banned`)
      fetchPlayers()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to ban')
    }
  }

  const totalPages = Math.max(1, Math.ceil(players.length / PAGE_SIZE))
  const pagePlayers = players.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (loading) return <p>Loading players...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Players</h2>
        <p>{players.length} players currently connected</p>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Steam ID</th>
              <th>Score</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagePlayers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No players connected
                </td>
              </tr>
            ) : (
              pagePlayers.map(player => (
                <tr key={player.id}>
                  <td>{player.id}</td>
                  <td>{player.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{player.steamId}</td>
                  <td>{player.score}</td>
                  <td>{player.time}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => kickPlayer(player.id, player.name)} style={{ marginRight: '5px' }}>
                      Kick
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => banPlayer(player.id, player.name)}>
                      Ban
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {players.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.includes('Failed') ? 'error' : 'success'}`}>{toast}</div>}
    </div>
  )
}
