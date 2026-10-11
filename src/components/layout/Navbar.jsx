import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Shirt,
  ShieldCheck,
  SearchX,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useRental } from '../../context/RentalContext'
import { products } from '../../data/products'
import { formatINR } from '../../utils/priceUtils'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/clothing' },
  { label: 'Categories', to: '/categories' },
  { label: 'Trending', to: '/clothing?trending=1' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'About', to: '/#about' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth()
  const { count: wishCount } = useWishlist()
  const { bagCount } = useRental()
  const navigate = useNavigate()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen || searchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen, searchOpen])

  const closeAll = () => {
    setDrawerOpen(false)
    setSearchOpen(false)
    setAccountOpen(false)
  }

  const submitSearch = (e) => {
    e?.preventDefault()
    if (query.trim()) {
      closeAll()
      navigate(`/clothing?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  const onSearchKey = (e) => {
    if (e.key === 'Enter') submitSearch()
  }

  const suggestions = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.color.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 6)
    : []

  const roleHome = role === 'HOST' || role === 'OWNER' ? '/host/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'

  const renderAccountArea = () => {
    if (!isAuthenticated) {
      return (
        <div
          className="d-flex align-items-center gap-2"
          onClick={() => navigate('/login')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/login')}
        >
          <span className="nav-icon-btn">
            <User size={20} aria-label="Profile" />
          </span>
          <span className="hide-xs d-none d-lg-inline text-uppercase small fw-semibold text-nowrap">Login</span>
        </div>
      )
    }
    return (
      <div className="position-relative" ref={accountRef}>
        <button
          type="button"
          className="nav-icon-btn"
          onClick={() => setAccountOpen((v) => !v)}
          aria-expanded={accountOpen}
          aria-label="Account menu"
        >
          <User size={20} aria-hidden="true" />
          <ChevronDown size={12} className="d-none d-lg-block" style={{ position: 'absolute', bottom: 6 }} aria-hidden="true" />
        </button>
        {accountOpen ? (
          <div
            className="position-absolute end-0 mt-2 bg-white shadow rounded-3 border"
            style={{ width: 210, zIndex: 1090, borderColor: 'var(--color-border)!important' }}
          >
            <Link to={roleHome} className="d-flex align-items-center gap-2 px-3 py-2 small text-decoration-none text-dark" onClick={closeAll}>
              <LayoutDashboard size={16} aria-hidden="true" /> My Dashboard
            </Link>
            <Link to="/wishlist" className="d-flex align-items-center gap-2 px-3 py-2 small text-decoration-none text-dark" onClick={closeAll}>
              <Heart size={16} aria-hidden="true" /> Wishlist
            </Link>
            <Link to="/my-rentals" className="d-flex align-items-center gap-2 px-3 py-2 small text-decoration-none text-dark" onClick={closeAll}>
              <Shirt size={16} aria-hidden="true" /> My Rentals
            </Link>
            <hr className="my-1" />
            <span className="d-block px-3 py-1 small text-muted text-nowrap" style={{ fontFamily: 'var(--font-sans)' }}>
              {user?.name}
            </span>
            <button
              type="button"
              className="d-flex align-items-center gap-2 w-100 border-0 bg-transparent px-3 py-2 small text-danger"
              onClick={() => {
                logout()
                closeAll()
                navigate('/')
              }}
            >
              <LogOut size={16} aria-hidden="true" /> Logout
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  const drawerLinks = [...NAV_LINKS]

  return (
    <header>
      <div className="announcement-bar">
        NEW SEASON EDIT — RENT YOUR NEXT LOOK · FREE DELIVERY OVER ₹1,000
      </div>
      <nav className="navbar-sr" aria-label="Main navigation">
        <div className="container">
          <div className="navbar-inner">
            <button
              type="button"
              className="nav-icon-btn mobile-menu-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} aria-hidden="true" />
            </button>

            <Link to="/" className="brand-sr" onClick={closeAll}>
              <span className="brand-mark">S</span>
              STYLE<span className="text-gold">RENT</span>
            </Link>

            <ul className="nav-links-sr desk-only">
              {NAV_LINKS.map((link) =>
                link.to.includes('?') ? (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ) : link.to.startsWith('/#') ? (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ) : (
                  <li key={link.label}>
                    <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                      {link.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>

            <div className="nav-actions-sr">
              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search clothing"
              >
                <Search size={20} aria-hidden="true" />
              </button>
              <Link to="/wishlist" className="nav-icon-btn" aria-label={`Wishlist (${wishCount} items)`}>
                <Heart size={20} aria-hidden="true" />
                {wishCount > 0 ? <span className="badge-sr">{wishCount}</span> : null}
              </Link>
              <Link to="/booking" className="nav-icon-btn" aria-label={`Rental bag (${bagCount} items)`}>
                <ShoppingBag size={20} aria-hidden="true" />
                {bagCount > 0 ? <span className="badge-sr">{bagCount}</span> : null}
              </Link>
              {renderAccountArea()}
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen ? (
        <div className="search-overlay" onClick={closeAll}>
          <form
            className="search-panel"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitSearch}
            role="search"
            aria-label="Search products"
          >
            <div className="search-top">
              <Search size={20} color="var(--color-muted)" aria-hidden="true" />
              <input
                autoFocus
                type="search"
                placeholder="Search lehengas, gowns, sherwanis…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
                aria-label="Search"
              />
              <button type="button" className="nav-icon-btn" onClick={closeAll} aria-label="Close search">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {query.trim() ? (
              <div className="search-suggestions">
                {suggestions.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <SearchX size={26} className="mx-auto mb-2 d-block" aria-hidden="true" />
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  suggestions.map((p) => (
                    <button
                      key={p.clothing_id}
                      type="button"
                      className="search-item w-100 text-start border-0 bg-transparent"
                      onClick={() => {
                        closeAll()
                        navigate(`/clothing/${p.clothing_id}`)
                      }}
                    >
                      <img src={p.image_url} alt="" loading="lazy" />
                      <span className="flex-grow-1">
                        <strong className="d-block" style={{ fontFamily: 'var(--font-serif)' }}>{p.name}</strong>
                        <span className="small text-muted">{formatINR(p.price_per_day)}/day</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </form>
        </div>
      ) : null}

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="mobile-drawer" onClick={closeAll}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <Link to="/" className="brand-sr" onClick={closeAll}>
                <span className="brand-mark">S</span>
                STYLE<span className="text-gold">RENT</span>
              </Link>
              <button type="button" className="nav-icon-btn" onClick={closeAll} aria-label="Close menu">
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile navigation">
              {drawerLinks.map((link) => (
                <Link key={link.label} to={link.to} className="drawer-link" onClick={closeAll}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4">
              {isAuthenticated ? (
                <>
                  <Link to={roleHome} className="btn btn-sr-primary btn-sr-block btn-sr-sm mb-2" onClick={closeAll}>
                    <LayoutDashboard size={15} aria-hidden="true" /> My Dashboard
                  </Link>
                  <Link to="/my-rentals" className="btn btn-sr-outline btn-sr-block btn-sr-sm" onClick={closeAll}>
                    <Shirt size={15} aria-hidden="true" /> My Rentals
                  </Link>
                </>
              ) : (
                <Link to="/login" className="btn btn-sr-primary btn-sr-block btn-sr-sm" onClick={closeAll}>
                  <User size={15} aria-hidden="true" /> Sign In
                </Link>
              )}
              <button
                type="button"
                className="btn btn-sr-ghost btn-sr-block btn-sr-sm mt-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  logout()
                  closeAll()
                }}
              >
                <LogOut size={15} aria-hidden="true" /> Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Role shortcut chip */}
      {isAuthenticated && role === 'ADMIN' ? (
        <Link to="/admin" className="dev-notice" title="See admin console">
          <ShieldCheck size={14} aria-hidden="true" /> Admin Console
        </Link>
      ) : null}
    </header>
  )
}