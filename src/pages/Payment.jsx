import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CreditCard, Smartphone, Landmark, Banknote, ShieldCheck, Lock } from 'lucide-react'
import Breadcrumbs from '../components/common/SearchBar'
import Button from '../components/common/Button'
import FormInput from '../components/common/FormInput'
import { LoadingSpinner, ErrorMessage } from '../components/common/States'
import { rentalAPI, paymentAPI } from '../services/api'
import { getProductById } from '../data/products'
import { useToast } from '../context/ToastContext'
import { formatINR } from '../utils/priceUtils'
import { formatDate, parseISO } from '../utils/dateUtils'
import { validatePayment } from '../utils/validation'

const METHODS = [
  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'Net Banking', label: 'Net Banking', icon: Landmark },
  { id: 'Cash', label: 'Cash on Delivery', icon: Banknote },
]

export default function Payment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [rental, setRental] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [method, setMethod] = useState('Card')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '', upi: '' })
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)

  const item = rental ? getProductById(rental.items?.[0]?.clothing_id) : null

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([rentalAPI.getById(id), paymentAPI.getByRental(id)])
      .then(([r, p]) => {
        if (!active) return
        setRental(r)
        setPayment(Array.isArray(p) ? p[0] || null : p || null)
      })
      .catch(() => active && setError('We could not find this booking.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    const validation = validatePayment(method, {
      cardNumber: card.number,
      expiry: card.expiry,
      cvv: card.cvv,
      upiId: card.upi,
    })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors({})
    setPaying(true)
    try {
      await paymentAPI.create({
        rental_id: Number(id),
        amount: rental.total_amount,
        payment_method: method,
      })
      toast.success('Payment successful!')
      navigate(`/rental-success/${id}`)
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div className="container section-space"><LoadingSpinner /></div>
  if (error || !rental) {
    return (
      <div className="container section-space py-5">
        <ErrorMessage message={error || 'Booking unavailable.'} />
      </div>
    )
  }

  if (payment && payment.payment_status === 'Paid') {
    return (
      <div className="container section-space py-5 text-center">
        <h1 className="page-title">Already paid</h1>
        <p className="text-muted-sr">This booking is settled. View it in your rentals.</p>
        <Link to={`/rental/${rental.rental_id}`} className="btn btn-sr-gold">View Booking</Link>
      </div>
    )
  }

  return (
    <div className="container section-space">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Booking', to: '/booking' },
          { label: 'Payment' },
        ]}
      />
      <h1 className="page-title mt-3 mb-4">Secure Payment</h1>

      <div className="row g-4">
        <div className="col-lg-7">
          <form onSubmit={submit} className="card-sr p-3 p-md-4" noValidate>
            <h5 className="mb-3">Choose Payment Method</h5>
            <div className="row g-2 mb-4">
              {METHODS.map((m) => (
                <div className="col-6" key={m.id}>
                  <button
                    type="button"
                    className={`payment-method ${method === m.id ? 'active' : ''}`}
                    onClick={() => setMethod(m.id)}
                    aria-pressed={method === m.id}
                  >
                    <m.icon size={20} aria-hidden="true" />
                    <span>{m.label}</span>
                  </button>
                </div>
              ))}
            </div>

            {method === 'Card' ? (
              <>
                <FormInput
                  id="pay-number"
                  label="Card Number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  value={card.number}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      number: e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 16)
                        .replace(/(.{4})/g, '$1 ')
                        .trim(),
                    })
                  }
                  error={errors.cardNumber}
                />
                <FormInput
                  id="pay-name"
                  label="Name on Card"
                  placeholder="PRIYA SHARMA"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                  error={errors.name}
                />
                <div className="row g-3">
                  <div className="col-6">
                    <FormInput
                      id="pay-expiry"
                      label="Expiry (MM/YY)"
                      placeholder="12/28"
                      maxLength={5}
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      error={errors.expiry}
                    />
                  </div>
                  <div className="col-6">
                    <FormInput
                      id="pay-cvv"
                      label="CVV"
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
                      error={errors.cvv}
                    />
                  </div>
                </div>
              </>
            ) : method === 'UPI' ? (
              <FormInput
                id="pay-upi"
                label="UPI ID"
                placeholder="yourname@upi"
                value={card.upi}
                onChange={(e) => setCard({ ...card, upi: e.target.value })}
                error={errors.upiId}
              />
            ) : method === 'Net Banking' ? (
              <div className="alert alert-light border small">
                You&rsquo;ll be redirected to your bank&rsquo;s secure page after confirming.
              </div>
            ) : (
              <div className="alert alert-light border small">
                Pay in cash when your outfit is delivered. Please keep exact change ready.
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" block loading={paying} icon={Lock}>
              Pay {formatINR(rental.total_amount)}
            </Button>
            <p className="text-muted-sr small text-center mt-3 mb-0 d-flex align-items-center justify-content-center gap-2">
              <ShieldCheck size={14} aria-hidden="true" /> Your payment details are never stored.
            </p>
          </form>
        </div>

        <div className="col-lg-5">
          <div className="summary-card">
            <h5 className="mb-3">Order Summary</h5>
            {item ? (
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <strong className="d-block" style={{ fontFamily: 'var(--font-serif)' }}>{item.name}</strong>
                  <span className="text-muted-sr small">
                    Size {rental.items[0].size} · Qty {rental.items[0].quantity}
                  </span>
                </div>
                <span>{formatINR(item.price_per_day)}/day</span>
              </div>
            ) : null}
            <div className="sum-row">
              <span>Rental Period</span>
              <span>
                {formatDate(parseISO(rental.start_date))} → {formatDate(parseISO(rental.end_date))}
              </span>
            </div>
            <div className="sum-row">
              <span>Booking ID</span>
              <span>#{rental.rental_id}</span>
            </div>
            <hr />
            <div className="sum-row sum-total">
              <span>Amount Due</span>
              <span>{formatINR(rental.total_amount)}</span>
            </div>
            <p className="text-muted-sr small mt-3 mb-0">
              Free cancellation within 24 hours of booking. Refundable deposit included.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}