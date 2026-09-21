import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, CalendarRange, ShieldCheck, CreditCard } from 'lucide-react'
import SmartImage from '../components/common/SmartImage'
import Breadcrumbs from '../components/common/SearchBar'
import Button from '../components/common/Button'
import { LoadingSpinner, EmptyState } from '../components/common/States'
import SizeSelector, { ColorSelector } from '../components/clothing/Selectors'
import { clothingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useRental } from '../context/RentalContext'
import { useToast } from '../context/ToastContext'
import { withCategoryName } from '../utils/productUtils'
import { formatINR, calcRentalTotal } from '../utils/priceUtils'
import { todayISO, addDaysISO, daysBetween, parseISO, formatDate, daysLabel } from '../utils/dateUtils'
import { validateBooking } from '../utils/validation'

const DEPOSIT_RATE = 0.15

export default function Booking() {
  const { user } = useAuth()
  const { draft, setRental, confirmBooking } = useRental()
  const toast = useToast()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (!draft.clothing_id) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    clothingAPI
      .getById(draft.clothing_id)
      .then((p) => active && setProduct(withCategoryName(p)))
      .catch(() => toast.error('Could not load the selected piece.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [draft.clothing_id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="container section-space"><LoadingSpinner /></div>

  if (!draft.clothing_id || !product) {
    return (
      <div className="container section-space py-5">
        <EmptyState
          title="Your rental bag is empty"
          message="Pick a piece you love and choose your date window to start a booking."
          icon={<ShoppingBag size={30} aria-hidden="true" />}
          action={
            <Link to="/clothing" className="btn btn-sr-gold">
              Browse the Collection
            </Link>
          }
        />
      </div>
    )
  }

  const maxDate = addDaysISO(todayISO(), 90)
  const days = daysBetween(parseISO(draft.startDate), parseISO(draft.endDate))
  const validWindow = days >= 1
  const subtotal = validWindow ? calcRentalTotal(product.price_per_day, days, draft.quantity) : 0
  const deposit = Math.round(subtotal * DEPOSIT_RATE)
  const delivery = subtotal >= 1000 ? 0 : 149
  const total = subtotal + delivery

  const placeOrder = async () => {
    const validation = validateBooking({
      size: draft.size,
      color: product.color,
      startDate: draft.startDate,
      endDate: draft.endDate,
      quantity: draft.quantity,
    })
    if (!validation.valid) {
      setFormErrors(validation.errors)
      toast.info(Object.values(validation.errors)[0])
      return
    }
    setFormErrors({})
    setPlacing(true)
    try {
      const created = await confirmBooking(user.user_id, total, product.price_per_day)
      toast.success('Booking confirmed — let’s get you paid.')
      navigate(`/payment/${created.rental_id}`)
    } catch (err) {
      toast.error(err.message || 'Could not place the booking.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container section-space">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop All', to: '/clothing' },
          { label: 'Booking' },
        ]}
      />
      <h1 className="page-title mt-3 mb-4">Review &amp; Book</h1>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card-sr p-3 p-md-4 mb-4">
            <h5 className="mb-3">Your Piece</h5>
            <div className="d-flex gap-3">
              <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: 110, aspectRatio: '3/4' }}>
                <SmartImage src={product.image_url} alt={product.name} className="w-100 h-100" />
              </div>
              <div className="flex-grow-1">
                <span className="product-category">{product.categoryName}</span>
                <h4 style={{ fontFamily: 'var(--font-serif)' }}>{product.name}</h4>
                <div className="mb-2">
                  <ColorSelector color={product.color} colorHex={product.colorHex} />
                </div>
                <span className="price-sr">{formatINR(product.price_per_day)}</span>
                <span className="price-per-day">/day</span>
              </div>
            </div>
          </div>

          <div className="card-sr p-3 p-md-4 mb-4">
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <CalendarRange size={18} aria-hidden="true" /> Rental Window
            </h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="sr-form-label" htmlFor="bk-start">Start Date</label>
                <input
                  id="bk-start"
                  type="date"
                  className="sr-input"
                  min={todayISO()}
                  max={maxDate}
                  value={draft.startDate}
                  onChange={(e) => setRental({ startDate: e.target.value })}
                />
              </div>
              <div className="col-sm-6">
                <label className="sr-form-label" htmlFor="bk-end">End Date</label>
                <input
                  id="bk-end"
                  type="date"
                  className="sr-input"
                  min={draft.startDate || todayISO()}
                  max={addDaysISO(draft.startDate || todayISO(), 30)}
                  value={draft.endDate}
                  onChange={(e) => setRental({ endDate: e.target.value })}
                />
              </div>
            </div>
            {!validWindow ? (
              <p className="sr-error-text mt-2 mb-0" role="alert">
                Please choose a valid date range (at least 1 day).
              </p>
            ) : (
              <p className="text-muted-sr small mt-2 mb-0">
                {daysLabel(days)} · {formatDate(parseISO(draft.startDate))} → {formatDate(parseISO(draft.endDate))}
              </p>
            )}
          </div>

          <div className="card-sr p-3 p-md-4">
            <h5 className="mb-3">Size &amp; Quantity</h5>
            <SizeSelector
              sizes={product.availableSizes}
              value={draft.size}
              onChange={(size) => setRental({ size })}
            />
            {formErrors.size ? (
              <p className="sr-error-text mt-2 mb-0" role="alert">{formErrors.size}</p>
            ) : null}
            <div className="mt-3 d-flex align-items-center gap-3">
              <span className="sr-form-label mb-0">Quantity</span>
              <div className="d-flex align-items-center border rounded" style={{ borderColor: 'var(--color-border)!important' }}>
                <button type="button" className="btn btn-sr-sm border-0" onClick={() => setRental({ quantity: Math.max(1, draft.quantity - 1) })}>−</button>
                <span className="px-3 fw-semibold">{draft.quantity}</span>
                <button type="button" className="btn btn-sr-sm border-0" onClick={() => setRental({ quantity: Math.min(product.stock, draft.quantity + 1) })}>+</button>
              </div>
              <span className="text-muted-sr small">{product.stock} available</span>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="summary-card sticky-lg-top" style={{ top: 100 }}>
            <h5 className="mb-3">Price Summary</h5>
            <div className="sum-row">
              <span>
                {formatINR(product.price_per_day)} × {days || 0} {days === 1 ? 'day' : 'days'} × {draft.quantity}
              </span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="sum-row">
              <span>Refundable deposit (15%)</span>
              <span>{formatINR(deposit)}</span>
            </div>
            <div className="sum-row">
              <span>Delivery</span>
              <span>{delivery === 0 ? 'FREE' : formatINR(delivery)}</span>
            </div>
            <hr />
            <div className="sum-row sum-total">
              <span>Total Payable</span>
              <span>{formatINR(total)}</span>
            </div>
            <p className="text-muted-sr small mt-2 mb-3">
              Deposit is refunded within 3–5 business days after a clean return.
            </p>
            <Button block size="lg" variant="gold" icon={CreditCard} loading={placing} onClick={placeOrder}>
              Proceed to Payment
            </Button>
            <Link to={`/clothing/${product.clothing_id}`} className="btn btn-sr-ghost btn-sr-block btn-sr-sm mt-2 d-flex align-items-center justify-content-center gap-2">
              <ArrowLeft size={14} aria-hidden="true" /> Back to item
            </Link>
            <div className="d-flex align-items-center gap-2 justify-content-center mt-3 text-muted-sr small">
              <ShieldCheck size={15} aria-hidden="true" /> Secure checkout · Free cancellation within 24h
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}