import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiCreditCard, FiLock, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import Button from '../../components/Button'
import { format } from 'date-fns'

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingData = location.state

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    if (!bookingData) {
      navigate('/catalog')
    }
  }, [bookingData, navigate])

  const getCardType = (number) => {
    const cleaned = number.replace(/\s/g, '')
    if (/^4/.test(cleaned)) return 'Visa'
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard'
    if (/^3[47]/.test(cleaned)) return 'Amex'
    return null
  }

  const cardType = getCardType(formData.cardNumber)

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '')
    const maxLength = cardType === 'Amex' ? 15 : 16
    const trimmed = cleaned.slice(0, maxLength)
    if (cardType === 'Amex') {
      return trimmed.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) => {
        let result = a
        if (b) result += ` ${b}`
        if (c) result += ` ${c}`
        return result
      }).trim()
    }
    return trimmed.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value)
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '')

    if (!cleanedCardNumber || cleanedCardNumber.length < (cardType === 'Amex' ? 15 : 16)) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    if (!formData.expiry || formData.expiry.length < 5) {
      newErrors.expiry = 'Please enter a valid expiry date'
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV'
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPaymentStatus(null)
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const success = Math.random() > 0.1

      if (success) {
        const newOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`
        setOrderId(newOrderId)
        setPaymentStatus('success')
      } else {
        setPaymentStatus('error')
      }
    } catch {
      setPaymentStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!bookingData) {
    return null
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">Payment Successful!</h2>
            <p className="text-text-light mb-4">Your booking has been confirmed.</p>
            <div className="bg-surface-alt rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-light">Order ID</span>
                <span className="font-mono font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-light">Item</span>
                <span className="font-medium">{bookingData.clothing.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-light">Duration</span>
                <span>{bookingData.rentalDays} days</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-light">Dates</span>
                <span>{format(new Date(bookingData.startDate), 'MMM dd')} - {format(new Date(bookingData.returnDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-lg border-t border-border pt-2 mt-2">
                <span>Total Paid</span>
                <span className="text-accent">${bookingData.total.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={() => navigate('/rentals')} variant="primary" size="lg" className="w-full">
              View My Rentals
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <button onClick={() => navigate('/booking/' + bookingData.clothing.id)} className="text-gray-300 hover:text-white transition-colors">
              Booking
            </button>
            <span className="text-gray-500">/</span>
            <span className="text-white">Payment</span>
          </nav>
          <h1 className="text-4xl font-bold font-heading">Payment</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                  <FiCreditCard className="text-accent" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold font-heading">Payment Details</h2>
                  <p className="text-sm text-text-light">Enter your card information</p>
                </div>
              </div>

              {paymentStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                  <FiXCircle size={20} />
                  <span>Payment failed. Please check your card details and try again.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="cardNumber" className="form-label">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      id="cardNumber"
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className={`form-input ${errors.cardNumber ? 'border-danger focus:ring-danger' : ''}`}
                      maxLength={cardType === 'Amex' ? 17 : 19}
                    />
                    {cardType && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-light">
                        {cardType}
                      </span>
                    )}
                  </div>
                  {errors.cardNumber && <p className="form-error">{errors.cardNumber}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="cardholderName" className="form-label">
                    Cardholder Name
                  </label>
                  <input
                    id="cardholderName"
                    type="text"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`form-input ${errors.cardholderName ? 'border-danger focus:ring-danger' : ''}`}
                  />
                  {errors.cardholderName && <p className="form-error">{errors.cardholderName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="expiry" className="form-label">
                      Expiry Date
                    </label>
                    <input
                      id="expiry"
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      className={`form-input ${errors.expiry ? 'border-danger focus:ring-danger' : ''}`}
                      maxLength={5}
                    />
                    {errors.expiry && <p className="form-error">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label htmlFor="cvv" className="form-label">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        id="cvv"
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className={`form-input ${errors.cvv ? 'border-danger focus:ring-danger' : ''}`}
                        maxLength={4}
                      />
                      <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" size={16} />
                    </div>
                    {errors.cvv && <p className="form-error">{errors.cvv}</p>}
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
                  Pay Now
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold font-heading mb-4">Booking Summary</h3>
              
              <div className="flex gap-4 mb-4">
                <img
                  src={bookingData.clothing.image}
                  alt={bookingData.clothing.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium">{bookingData.clothing.name}</h4>
                  <p className="text-sm text-text-light">{bookingData.clothing.category}</p>
                  <p className="text-sm text-text-light">
                    {format(new Date(bookingData.startDate), 'MMM dd, yyyy')} - {format(new Date(bookingData.returnDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-text-light">Duration</span>
                  <span>{bookingData.rentalDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Rental Amount</span>
                  <span>${bookingData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Security Deposit</span>
                  <span>${bookingData.securityDeposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-accent">${bookingData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 card p-4">
              <div className="flex items-center gap-2 text-sm text-text-light">
                <FiLock className="text-success" />
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
