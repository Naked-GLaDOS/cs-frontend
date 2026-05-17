import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Console } from './pages/Console'
import { Players } from './pages/Players'
import { Maps } from './pages/Maps'
import { GameModes } from './pages/GameModes'
import { Settings } from './pages/Settings'
import { ServerControl } from './pages/ServerControl'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
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
