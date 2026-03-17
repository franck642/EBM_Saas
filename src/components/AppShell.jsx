import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Database, Users, Send, ScrollText, LogOut
} from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/databases', icon: Database,        label: 'Bases de données' },
  { to: '/employees', icon: Users,           label: 'Employés' },
  { to: '/send',      icon: Send,            label: 'Envoyer bulletins' },
  { to: '/logs',      icon: ScrollText,      label: 'Historique' },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">EBM</div>
            <div>
              <div className="logo-text">EBM SaaS</div>
              <div className="logo-sub">Bulletins de paie</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info" style={{ flex:1, minWidth:0 }}>
              <div className="user-name truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email}
              </div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Déconnexion">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}