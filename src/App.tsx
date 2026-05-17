import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Gateway } from './pages/Gateway'
import { Dashboard } from './pages/Dashboard'
import { Console } from './pages/Console'
import { Players } from './pages/Players'
import { Maps } from './pages/Maps'
import { GameModes } from './pages/GameModes'
import { Settings } from './pages/Settings'
import { ServerControl } from './pages/ServerControl'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Establishing uplink...</div>
  if (!user) return <Navigate to="/" replace />
  const hasAccess = user.scope === 'admin' || user.permissions?.includes('cs2')
  if (!hasAccess) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ borderColor: 'var(--danger)' }}>
          <h1 style={{ color: 'var(--danger)' }}>INSUFFICIENT CLEARANCE</h1>
          <p>Your neural link lacks the CS2 access protocol. Contact system administration.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = 'https://naked-glados.com'} style={{ marginTop: '20px' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Gateway />} />
          <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="console" element={<Console />} />
            <Route path="players" element={<Players />} />
            <Route path="maps" element={<Maps />} />
            <Route path="gamemodes" element={<GameModes />} />
            <Route path="settings" element={<Settings />} />
            <Route path="server" element={<ServerControl />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
