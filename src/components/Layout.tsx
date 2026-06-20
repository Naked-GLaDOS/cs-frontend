import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Terminal,
  Users,
  Map,
  Gamepad2,
  Settings,
  Server,
  LogOut,
  Shield,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/console', label: 'Console', icon: Terminal },
  { path: '/players', label: 'Players', icon: Users },
  { path: '/maps', label: 'Maps', icon: Map },
  { path: '/gamemodes', label: 'Game Modes', icon: Gamepad2 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/server', label: 'Server', icon: Server },
]

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Shield size={22} />
            <span>CS2 Control</span>
          </div>
          <p>NakedGLaDOS</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
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
            <button className="btn btn-sm btn-secondary btn-icon-only" onClick={logout} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
