import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, CalendarRange, Package, Home, Receipt } from 'lucide-react'
import { LoadingSpinner, ErrorMessage } from '../components/common/States'
import { rentalAPI, paymentAPI } from '../services/api'
import { getProductById } from '../data/products'
import { formatINR } from '../utils/priceUtils'
import { formatDate, parseISO, daysBetween, daysLabel } from '../utils/dateUtils'

export default function RentalSuccess() {
  const { id } = useParams()
  const [rental, setRental] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([rentalAPI.getById(id), paymentAPI.getByRental(id)])
      .then(([r, p]) => {
        if (!active) return
        setRental(r)
        setPayment(Array.isArray(p) ? p[0] || null : p || null)
      })
      .catch(() => active && setError('We could not load your booking.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <div className="container section-space"><LoadingSpinner /></div>
  if (error || !rental) {
    return (
      <div className="container section-space py-5">
        <ErrorMessage message={error || 'Booking unavailable.'} />
      </div>
    )
  }

  const item = getProductById(rental.items?.[0]?.clothing_id)
  const days = daysBetween(parseISO(rental.start_date), parseISO(rental.end_date))

  return (
    <div className="container section-space">
      <div className="success-wrap text-center mx-auto" style={{ maxWidth: 720 }}>
        <span className="success-badge">
          <CheckCircle2 size={40} aria-hidden="true" />
        </span>
        <h1 className="page-title mt-3">Booking Confirmed!</h1>
        <p className="text-muted-sr">
          Your look is reserved. We&rsquo;ll send delivery updates to your email.
        </p>

        <div className="card-sr p-4 text-start mt-4">
          <div className="d-flex justify-content-between flex-wrap gap-2 align-items-center mb-3">
            <span className="badge-soft">Booking #{rental.rental_id}</span>
            <span className={`status-badge ${payment?.payment_status === 'Paid' ? 'status-paid' : 'status-unpaid'}`}>
              <span className="dot" aria-hidden="true" />
              Payment {payment?.payment_status || 'Pending'}
            </span>
          </div>

          {item ? (
            <div className="d-flex gap-3 mb-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="rounded"
                style={{ width: 72, height: 96, objectFit: 'cover' }}
              />
              <div>
                <strong className="d-block" style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>
                  {item.name}
                </strong>
                <span className="text-muted-sr small d-block">
                  Size {rental.items[0].size} · Qty {rental.items[0].quantity}
                </span>
                <span className="price-sr mt-2 d-inline-block">{formatINR(rental.total_amount)}</span>
              </div>
            </div>
          ) : null}

          <div className="row g-3">
            <div className="col-sm-4">
              <span className="metric-label"><CalendarRange size={14} aria-hidden="true" /> Rental Window</span>
              <p className="mb-0 small">
                {formatDate(parseISO(rental.start_date))} → {formatDate(parseISO(rental.end_date))}
                <br />
                <span className="text-muted-sr">{daysLabel(days)}</span>
              </p>
            </div>
            <div className="col-sm-4">
              <span className="metric-label"><Package size={14} aria-hidden="true" /> Status</span>
              <p className="mb-0 small">{rental.status}</p>
            </div>
            <div className="col-sm-4">
              <span className="metric-label"><Receipt size={14} aria-hidden="true" /> Payment Method</span>
              <p className="mb-0 small">{payment?.payment_method || '—'}</p>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          <Link to={`/rental/${rental.rental_id}`} className="btn btn-sr-gold">
            View Booking Details
          </Link>
          <Link to="/my-rentals" className="btn btn-sr-outline">
            My Rentals
          </Link>
          <Link to="/clothing" className="btn btn-sr-ghost">
            <Home size={16} aria-hidden="true" /> Keep Shopping
          </Link>
        </div>

        <p className="text-muted-sr small mt-4">
          A confirmation has been sent. Need to change something? You can reschedule once for free
          within 24 hours.
        </p>
      </div>
    </div>
  )
}