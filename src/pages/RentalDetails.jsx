import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarRange,
  CreditCard,
  MapPin,
  Star,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import Breadcrumbs from '../components/common/SearchBar'
import StatusBadge from '../components/common/StatusBadge'
import { LoadingSpinner, ErrorMessage } from '../components/common/States'
import { rentalAPI, paymentAPI } from '../services/api'
import { getProductById } from '../data/products'
import { formatINR } from '../utils/priceUtils'
import { formatDate, parseISO, daysBetween, daysLabel } from '../utils/dateUtils'

const TIMELINE = ['Pending', 'Confirmed', 'Active', 'Returned']

export default function RentalDetails() {
  const { id } = useParams()
  const [rental, setRental] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([rentalAPI.getById(id), paymentAPI.getByRental(id)])
      .then(([r, p]) => {
        if (!active) return
        setRental(r)
        setPayment(p)
      })
      .catch(() => active && setError('We could not find this booking.'))
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

  const items = (rental.items || []).map((it) => ({
    ...it,
    product: getProductById(it.clothing_id),
  }))
  const days = daysBetween(parseISO(rental.start_date), parseISO(rental.end_date))
  const activeIndex = TIMELINE.indexOf(rental.status)
  const isCancelled = rental.status === 'Cancelled'

  return (
    <div className="container section-space">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My Rentals', to: '/my-rentals' },
          { label: `Booking #${rental.rental_id}` },
        ]}
      />

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 mb-4">
        <div>
          <span className="kicker">Booking</span>
          <h1 className="page-title mb-0">#{rental.rental_id}</h1>
        </div>
        <StatusBadge status={rental.status} type="rental" />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Items */}
          <div className="card-sr p-3 p-md-4 mb-4">
            <h5 className="mb-3">Items</h5>
            {items.map((it) => (
              <div className="d-flex gap-3 py-2 border-bottom" key={it.item_id}>
                <img
                  src={it.product?.image_url}
                  alt={it.product?.name || 'Item'}
                  className="rounded flex-shrink-0"
                  style={{ width: 70, height: 90, objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <Link to={`/clothing/${it.clothing_id}`} className="text-decoration-none text-dark">
                    <strong className="d-block" style={{ fontFamily: 'var(--font-serif)' }}>
                      {it.product?.name || 'Item'}
                    </strong>
                  </Link>
                  <span className="text-muted-sr small d-block">
                    Size {it.size} · Qty {it.quantity}
                  </span>
                  <span className="small d-block">{formatINR(it.price)}/day</span>
                </div>
                {rental.status === 'Returned' ? (
                  <Link to={`/review/${it.clothing_id}`} className="btn btn-sr-ghost btn-sr-sm align-self-center d-flex align-items-center gap-1">
                    <Star size={13} aria-hidden="true" /> Review
                  </Link>
                ) : null}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="card-sr p-3 p-md-4 mb-4">
            <h5 className="mb-4">Order Status</h5>
            {isCancelled ? (
              <p className="text-muted-sr mb-0">This booking was cancelled.</p>
            ) : (
              <div className="timeline">
                {TIMELINE.map((step, i) => (
                  <div className={`timeline-step ${i <= activeIndex ? 'done' : ''}`} key={step}>
                    <span className="timeline-dot">
                      {i <= activeIndex ? <CheckCircle2 size={16} aria-hidden="true" /> : <Clock size={15} aria-hidden="true" />}
                    </span>
                    <span className="timeline-label">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="card-sr p-3 p-md-4">
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <MapPin size={18} aria-hidden="true" /> Delivery Details
            </h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <span className="metric-label"><CalendarRange size={14} aria-hidden="true" /> Rental Window</span>
                <p className="mb-0 small">
                  {formatDate(parseISO(rental.start_date))} → {formatDate(parseISO(rental.end_date))}
                  <br />
                  <span className="text-muted-sr">{daysLabel(days)}</span>
                </p>
              </div>
              <div className="col-sm-6">
                <span className="metric-label"><Truck size={14} aria-hidden="true" /> Delivery</span>
                <p className="mb-0 small">
                  Standard delivery · Free over ₹1,000
                  <br />
                  <span className="text-muted-sr">Tracking emailed 24h before dispatch</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="summary-card mb-4">
            <h5 className="mb-3">Payment</h5>
            <div className="sum-row">
              <span>Rental total</span>
              <span>{formatINR(rental.total_amount)}</span>
            </div>
            <div className="sum-row">
              <span>Method</span>
              <span>{payment?.payment_method || '—'}</span>
            </div>
            <div className="sum-row">
              <span>Status</span>
              <span>
                <span className={`status-badge ${payment?.payment_status === 'Paid' ? 'status-paid' : payment?.payment_status === 'Refunded' ? 'status-refunded' : 'status-unpaid'}`}>
                  <span className="dot" aria-hidden="true" />
                  {payment?.payment_status || 'Pending'}
                </span>
              </span>
            </div>
            <hr />
            <div className="sum-row sum-total">
              <span>Total Paid</span>
              <span>{formatINR(payment?.amount ?? rental.total_amount)}</span>
            </div>
            {payment?.payment_date ? (
              <p className="text-muted-sr small mt-2 mb-0">
                <CreditCard size={13} className="me-1" aria-hidden="true" />
                {formatDate(parseISO(payment.payment_date))}
              </p>
            ) : null}
          </div>

          <Link to="/my-rentals" className="btn btn-sr-outline btn-sr-block btn-sr-sm d-flex align-items-center justify-content-center gap-2">
            <ArrowLeft size={14} aria-hidden="true" /> Back to My Rentals
          </Link>
        </div>
      </div>
    </div>
  )
}