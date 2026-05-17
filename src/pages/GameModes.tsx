import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface GameMode {
  id: string
  name: string
  description: string
}

export function GameModes() {
  const [modes, setModes] = useState<GameMode[]>([])
  const [currentMode, setCurrentMode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api<{ modes: GameMode[] }>('/gamemodes')
        setModes(data.modes)
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

  const setMode = async (mode: string) => {
    try {
      await api('/gamemodes/set', {
        method: 'POST',
        body: JSON.stringify({ mode }),
      })
      setCurrentMode(mode)
      showToast(`Game mode set to ${mode}`)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to set game mode')
    }
  }

  if (loading) return <p>Loading game modes...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Game Modes</h2>
        <p>Select a game mode for the server</p>
      </div>

      <div className="grid grid-3">
        {modes.map(mode => (
          <div
            key={mode.id}
            className={`gamemode-card ${mode.id === currentMode ? 'active' : ''}`}
            onClick={() => setMode(mode.id)}
          >
            <h4>{mode.name}</h4>
            <p>{mode.description}</p>
          </div>
        ))}
      </div>

      {toast && <div className={`toast ${toast.includes('Failed') ? 'error' : 'success'}`}>{toast}</div>}
    </div>
  )
}
