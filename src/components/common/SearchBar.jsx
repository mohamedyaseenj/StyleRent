import { Search, ChevronRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'

// Inline search input used by the shop page and dashboards.
export function SearchInput({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={`position-relative ${className}`} style={{ minWidth: 220 }}>
      <Search
        size={16}
        className="position-absolute"
        style={{ left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}
        aria-hidden="true"
      />
      <input
        type="search"
        className="sr-input"
        style={{ paddingLeft: 38, paddingRight: value ? 36 : 14 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          className="border-0 bg-transparent position-absolute"
          style={{ right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={15} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

// Small breadcrumb trail.
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs list-unstyled d-flex align-items-center flex-wrap m-0">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="d-flex align-items-center gap-2">
              {item.to && !last ? (
                <Link to={item.to} className="text-decoration-none">{item.label}</Link>
              ) : (
                <span style={{ color: last ? 'var(--color-gold-soft)' : undefined }}>{item.label}</span>
              )}
              {!last ? <ChevronRight size={12} aria-hidden="true" /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs