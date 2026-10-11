import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageOpen, CalendarRange, Eye, Star, XCircle } from 'lucide-react'
import Breadcrumbs from '../components/common/SearchBar'
import StatusBadge from '../components/common/StatusBadge'
import { LoadingSpinner, EmptyState, ErrorMessage } from '../components/common/States'
import { rentalAPI } from '../services/api'
import { getProductById } from '../data/products'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatINR } from '../utils/priceUtils'
import { formatDate, parseISO, daysLabel, daysBetween } from '../utils/dateUtils'

const TABS = ['All', 'Pending', 'Confirmed', 'Active', 'Returned', 'Cancelled']

export default function MyRentals() {
  const { user } = useAuth()
  const toast = useToast()
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('All')
  const [cancelled, setCancelled] = useState([])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    rentalAPI
      .getMyRentals(user?.user_id)
      .then((list) => active && setRentals(list))
      .catch(() => active && setError('Could not load your rentals. Please try again.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user?.user_id])

  const rows = useMemo(
    () =>
      rentals.map((r) => ({
        ...r,
        status: cancelled.includes(r.rental_id) ? 'Cancelled' : r.status,
      })),
    [rentals, cancelled],
  )

  const filtered = tab === 'All' ? rows : rows.filter((r) => r.status === tab)

  const cancel = async (id) => {
    try {
      await rentalAPI.cancel(id)
      setRentals((prev) =>
        prev.map((r) => (r.rental_id === id ? { ...r, status: 'Cancelled' } : r)),
      )
      setCancelled((prev) => (prev.includes(id) ? prev : [...prev, id]))
      toast.info('Cancellation requested. Refunds process in 3–5 days.')
    } catch (err) {
      toast.error(err?.message || 'Could not cancel this booking. Please try again.')
    }
  }

  return (
    <div className="container section-space">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Rentals' }]} />
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mt-3 mb-4">
        <div>
          <span className="kicker">Your wardrobe history</span>
          <h1 className="page-title mb-0">My Rentals</h1>
        </div>
        <Link to="/clothing" className="btn btn-sr-gold btn-sr-sm">Rent Something New</Link>
      </div>

      <div className="tab-row mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tab-chip ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            <span className="tab-count">
              {t === 'All' ? rows.length : rows.filter((r) => r.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error && rows.length === 0 ? (
        <ErrorMessage message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${tab === 'All' ? '' : tab.toLowerCase()} rentals`}
          message="When you book a look, it will appear here with its status and delivery details."
          icon={<PackageOpen size={30} aria-hidden="true" />}
          action={<Link to="/clothing" className="btn btn-sr-gold">Browse Collection</Link>}
        />
      ) : (
        <div className="row g-3">
          {filtered.map((rental) => {
            const items = rental.items || []
            const first = getProductById(items[0]?.clothing_id)
            const days = daysBetween(parseISO(rental.start_date), parseISO(rental.end_date))
            return (
              <div className="col-12" key={rental.rental_id}>
                <div className="rental-row card-sr p-3 p-md-4">
                  <div className="d-flex gap-3 flex-column flex-md-row align-items-md-center">
                    <img
                      src={first?.image_url}
                      alt={first?.name || 'Rental item'}
                      className="rounded flex-shrink-0"
                      style={{ width: 84, height: 108, objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <StatusBadge status={rental.status} type="rental" />
                        <span className="text-muted-sr small">#{rental.rental_id}</span>
                      </div>
                      <h4 className="mb-1" style={{ fontFamily: 'var(--font-serif)', fontSize: 19 }}>
                        {first?.name || 'Rental'}
                        {items.length > 1 ? ` + ${items.length - 1} more` : ''}
                      </h4>
                      <p className="text-muted-sr small mb-1 d-flex align-items-center gap-2">
                        <CalendarRange size={14} aria-hidden="true" />
                        {formatDate(parseISO(rental.start_date))} → {formatDate(parseISO(rental.end_date))}
                        <span className="text-muted-sr">· {daysLabel(days)}</span>
                      </p>
                      <span className="price-sr">{formatINR(rental.total_amount)}</span>
                    </div>
                    <div className="d-flex flex-column gap-2 flex-shrink-0" style={{ minWidth: 160 }}>
                      <Link to={`/rental/${rental.rental_id}`} className="btn btn-sr-outline btn-sr-sm d-flex align-items-center justify-content-center gap-2">
                        <Eye size={14} aria-hidden="true" /> View Details
                      </Link>
                      {rental.status === 'Returned' && first ? (
                        <Link to={`/review/${first.clothing_id}`} className="btn btn-sr-ghost btn-sr-sm d-flex align-items-center justify-content-center gap-2">
                          <Star size={14} aria-hidden="true" /> Write Review
                        </Link>
                      ) : null}
                      {(rental.status === 'Pending' || rental.status === 'Confirmed') ? (
                        <button
                          type="button"
                          className="btn btn-sr-ghost btn-sr-sm text-danger d-flex align-items-center justify-content-center gap-2"
                          onClick={() => cancel(rental.rental_id)}
                        >
                          <XCircle size={14} aria-hidden="true" /> Cancel Booking
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}