import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function Settings() {
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      const data = await api<{ settings: Record<string, string> }>('/settings')
      setEditing(data.settings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const saveSettings = async () => {
    try {
      await api('/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: editing }),
      })
      setSettings(editing)
      showToast('Settings saved')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  const updateSetting = (key: string, value: string) => {
    setEditing(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <p>Loading settings...</p>

  const settingLabels: Record<string, string> = {
    mp_maxrounds: 'Max Rounds',
    mp_roundtime: 'Round Time (minutes)',
    mp_roundtime_defuse: 'Defuse Round Time',
    mp_freezetime: 'Freeze Time (seconds)',
    mp_buytime: 'Buy Time (seconds)',
    mp_startmoney: 'Start Money',
    mp_maxmoney: 'Max Money',
    mp_teamcashawards: 'Team Cash Awards',
    mp_playercashawards: 'Player Cash Awards',
    mp_friendlyfire: 'Friendly Fire',
    mp_autokick: 'Auto Kick',
    mp_solid_teammates: 'Solid Teammates',
    sv_cheats: 'Cheats',
    hostname: 'Server Name',
    sv_password: 'Server Password',
  }

  return (
    <div>
      <div className="page-header">
        <h2>Server Settings</h2>
        <p>Configure CS2 server parameters</p>
      </div>

      <div className="card">
        <div className="settings-grid">
          {Object.entries(editing).map(([key, value]) => (
            <div className="input-group" key={key}>
              <label>{settingLabels[key] || key}</label>
              <input
                type="text"
                value={value}
                onChange={e => updateSetting(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
          <button className="btn btn-secondary" onClick={fetchSettings}>Reset</button>
        </div>
      </div>

      {toast && <div className={`toast ${toast.includes('Failed') ? 'error' : 'success'}`}>{toast}</div>}
    </div>
  )
}
