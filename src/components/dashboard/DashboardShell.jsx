import { NavLink, Link, Outlet } from 'react-router-dom'
import { LayoutDashboard, Shirt, CalendarCheck2, Wallet, LogOut, Users, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const OWNER_LINKS = [
  { label: 'Overview', to: '/owner', icon: LayoutDashboard, end: true },
  { label: 'My Clothing', to: '/owner/clothing', icon: Shirt },
  { label: 'Rentals', to: '/owner/rentals', icon: CalendarCheck2 },
  { label: 'Revenue', to: '/owner/revenue', icon: Wallet },
]

const ADMIN_LINKS = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Shirt },
  { label: 'Categories', to: '/admin/categories', icon: LayoutDashboard },
  { label: 'Rentals', to: '/admin/rentals', icon: CalendarCheck2 },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
]

export default function DashboardShell({ kind = 'owner', title, subtitle }) {
  const { user, logout } = useAuth()
  const links = kind === 'admin' ? ADMIN_LINKS : OWNER_LINKS
  const accent = kind === 'admin' ? 'Admin' : 'Owner'

  return (
    <div className="dash-shell container-fluid px-0">
      <aside className="dash-sidebar">
        <div className="p-3">
          <Link to="/" className="brand-sr mb-4 d-inline-block">
            <span className="brand-mark">S</span>
            STYLE<span className="text-gold">RENT</span>
          </Link>
          <p className="small text-uppercase text-muted-sr mb-2" style={{ letterSpacing: '0.16em' }}>
            {accent} Area
          </p>
          <nav className="dash-nav">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `dash-nav-link ${isActive ? 'active' : ''}`}
              >
                <link.icon size={17} aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="dash-sidebar-bottom p-3">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="avatar-sr" aria-hidden="true">
              {String(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="text-truncate small">
              <strong className="d-block text-truncate" style={{ fontFamily: 'var(--font-serif)' }}>{user?.name}</strong>
              <span className="text-muted-sr">{user?.email}</span>
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sr-ghost btn-sr-block btn-sr-sm d-flex align-items-center justify-content-center gap-2"
            onClick={logout}
          >
            <LogOut size={15} aria-hidden="true" /> Logout
          </button>
        </div>
      </aside>

      <section className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-title">{title}</h1>
            {subtitle ? <p className="text-muted-sr small mb-0">{subtitle}</p> : null}
          </div>
        </div>
        <div className="container-fluid px-lg-5 py-4">
          <Outlet />
        </div>
      </section>
    </div>
  )
}