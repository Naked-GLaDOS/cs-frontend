import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/console', label: 'Console', icon: '💻' },
  { path: '/players', label: 'Players', icon: '👥' },
  { path: '/maps', label: 'Maps', icon: '🗺️' },
  { path: '/gamemodes', label: 'Game Modes', icon: '🎮' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
  { path: '/server', label: 'Server', icon: '🖥️' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>CS2 Control</h1>
          <p>NakedGLaDOS</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <div className="user-email">{user?.email}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={logout}>⏻</button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
