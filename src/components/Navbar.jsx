import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingBag } from 'react-icons/fi'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'admin': return '/admin'
      case 'owner': return '/owner'
      default: return '/rentals'
    }
  }

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <FiShoppingBag className="text-2xl text-gold" />
            <span className="text-xl font-bold font-heading">StyleRent</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/catalog" className="hover:text-gold transition-colors">Catalog</Link>
            <Link to="/catalog?category=Evening+Gowns" className="hover:text-gold transition-colors">Evening</Link>
            <Link to="/catalog?category=Party+Dresses" className="hover:text-gold transition-colors">Party</Link>
            <Link to="/catalog?category=Formal+Suits" className="hover:text-gold transition-colors">Formal</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="hover:text-gold transition-colors flex items-center gap-1">
                  <FiUser /> Dashboard
                </Link>
                <button onClick={handleLogout} className="hover:text-gold transition-colors flex items-center gap-1">
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gold transition-colors">Login</Link>
                <Link to="/register" className="btn-gold px-4 py-2 rounded-lg text-sm">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-2xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link to="/catalog" className="block hover:text-gold transition-colors">Catalog</Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block hover:text-gold transition-colors">Dashboard</Link>
                <button onClick={handleLogout} className="block hover:text-gold transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-gold transition-colors">Login</Link>
                <Link to="/register" className="block btn-gold px-4 py-2 rounded-lg text-sm text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
