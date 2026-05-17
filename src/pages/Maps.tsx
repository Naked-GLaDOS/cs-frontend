import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function Maps() {
  const [maps, setMaps] = useState<string[]>([])
  const [currentMap, setCurrentMap] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mapsData, statusData] = await Promise.all([
          api<{ maps: string[] }>('/maps'),
          api<{ map?: string }>('/status'),
        ])
        setMaps(mapsData.maps)
        setCurrentMap(statusData.map || '')
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const changeMap = async (map: string) => {
    if (changing) return
    if (!confirm(`Change map to ${map}? This will disconnect all players.`)) return

    setChanging(true)
    try {
      await api('/maps/change', {
        method: 'POST',
        body: JSON.stringify({ map }),
      })
      setCurrentMap(map)
      showToast(`Changing to ${map}...`)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to change map')
    } finally {
      setChanging(false)
    }
  }

  if (loading) return <p>Loading maps...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Maps</h2>
        <p>Current map: <strong style={{ color: 'var(--accent)' }}>{currentMap || 'Unknown'}</strong></p>
      </div>

      <div className="map-grid">
        {maps.map(map => (
          <div
            key={map}
            className={`map-card ${map === currentMap ? 'active' : ''}`}
            onClick={() => changeMap(map)}
            style={{ opacity: changing ? 0.5 : 1, cursor: changing ? 'not-allowed' : 'pointer' }}
          >
            <h4>{map}</h4>
            <p>{map === currentMap ? 'Current' : 'Click to change'}</p>
          </div>
        ))}
      </div>

      {toast && <div className={`toast ${toast.includes('Failed') ? 'error' : 'success'}`}>{toast}</div>}
    </div>
  )
}
