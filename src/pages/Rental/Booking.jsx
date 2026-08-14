import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { FiCalendar, FiShield, FiCheckCircle } from 'react-icons/fi'
import RentalSummary from '../../components/RentalSummary'
import Button from '../../components/Button'
import { clothingItems } from '../../data/mockData'

export default function Booking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = clothingItems.find((c) => c.id === parseInt(id))

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [startDate, setStartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState({})

  const rentalDays = useMemo(() => {
    if (!startDate || !returnDate) return 0
    const days = differenceInDays(new Date(returnDate), new Date(startDate))
    return days > 0 ? days : 0
  }, [startDate, returnDate])

  const pricePerDay = item?.price || 0
  const subtotal = rentalDays * pricePerDay
  const securityDeposit = Math.max(50, subtotal * 0.2)
  const total = subtotal + securityDeposit

  const validate = () => {
    const newErrors = {}
    if (!startDate) newErrors.startDate = 'Start date is required'
    if (!returnDate) newErrors.returnDate = 'Return date is required'
    if (startDate && returnDate && rentalDays <= 0) {
      newErrors.returnDate = 'Return date must be after start date'
    }
    if (!agreedToTerms) newErrors.terms = 'You must agree to the terms and conditions'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    navigate('/payment', {
      state: {
        clothing: item,
        startDate,
        returnDate,
        rentalDays,
        pricePerDay,
        subtotal,
        securityDeposit,
        total,
      },
    })
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading mb-2">Item Not Found</h2>
          <p className="text-text-light mb-4">The clothing item you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/catalog')} className="btn-primary">
            Back to Catalog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <button onClick={() => navigate('/catalog')} className="text-gray-300 hover:text-white transition-colors">
              Catalog
            </button>
            <span className="text-gray-500">/</span>
            <button onClick={() => navigate(`/catalog/${item.id}`)} className="text-gray-300 hover:text-white transition-colors">
              {item.name}
            </button>
            <span className="text-gray-500">/</span>
            <span className="text-white">Booking</span>
          </nav>
          <h1 className="text-4xl font-bold font-heading">Complete Your Booking</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold font-heading mb-6">Selected Clothing</h2>
                <div className="flex flex-col sm:flex-row gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full sm:w-48 h-64 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <span className="inline-block text-sm text-text-light bg-surface-alt px-3 py-1 rounded-full mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-2xl font-bold font-heading mb-2">{item.name}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-accent">${item.price}</span>
                      <span className="text-text-light line-through">${item.originalPrice}</span>
                      <span className="text-text-light">/day</span>
                    </div>
                    <div className="space-y-2 text-sm text-text-light">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="text-accent" />
                        <span>Available for rent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiShield className="text-accent" />
                        <span>Damage protection included</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-accent" />
                        <span>Free shipping & returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold font-heading mb-6">Rental Dates</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="form-label">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value)
                          if (errors.startDate) {
                            setErrors((prev) => ({ ...prev, startDate: '' }))
                          }
                        }}
                        className={`form-input ${errors.startDate ? 'border-danger focus:ring-danger' : ''}`}
                        min={today}
                      />
                      <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
                    </div>
                    {errors.startDate && <p className="form-error">{errors.startDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="returnDate" className="form-label">
                      Return Date
                    </label>
                    <div className="relative">
                      <input
                        id="returnDate"
                        type="date"
                        value={returnDate}
                        onChange={(e) => {
                          setReturnDate(e.target.value)
                          if (errors.returnDate) {
                            setErrors((prev) => ({ ...prev, returnDate: '' }))
                          }
                        }}
                        className={`form-input ${errors.returnDate ? 'border-danger focus:ring-danger' : ''}`}
                        min={startDate || today}
                      />
                      <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
                    </div>
                    {errors.returnDate && <p className="form-error">{errors.returnDate}</p>}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked)
                      if (errors.terms) {
                        setErrors((prev) => ({ ...prev, terms: '' }))
                      }
                    }}
                    className="w-5 h-5 text-accent border-gray-300 rounded focus:ring-accent mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm text-text cursor-pointer">
                    I agree to the{' '}
                    <span className="text-accent hover:underline cursor-pointer">
                      Terms and Conditions
                    </span>{' '}
                    and{' '}
                    <span className="text-accent hover:underline cursor-pointer">
                      Rental Policy
                    </span>
                    . I understand that a security deposit will be held and refunded upon return of the item in good condition.
                  </label>
                </div>
                {errors.terms && <p className="form-error mt-2">{errors.terms}</p>}
              </div>
            </div>

            <div className="lg:col-span-1">
              <RentalSummary
                clothing={item}
                startDate={startDate}
                returnDate={returnDate}
                rentalDays={rentalDays}
                pricePerDay={pricePerDay}
                securityDeposit={securityDeposit}
              />
              <div className="mt-6">
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Proceed to Payment
                </Button>
                <p className="text-xs text-text-light text-center mt-3">
                  You won't be charged until you complete payment
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
