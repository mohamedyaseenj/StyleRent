import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="text-center px-3">
        <span className="notfound-code">404</span>
        <h1 className="page-title mt-2">This look doesn&rsquo;t exist</h1>
        <p className="text-muted-sr mb-4">
          The page you&rsquo;re looking for has been returned to the atelier. Let&rsquo;s get
          you back to something beautiful.
        </p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <Link to="/" className="btn btn-sr-gold">
            <Home size={16} aria-hidden="true" /> Back Home
          </Link>
          <Link to="/clothing" className="btn btn-sr-outline">
            <Search size={16} aria-hidden="true" /> Browse Collection
          </Link>
        </div>
      </div>
    </div>
  )
}