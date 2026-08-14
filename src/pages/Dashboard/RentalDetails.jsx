import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiCalendar, FiCreditCard, FiMapPin, FiClock, FiCheckCircle, FiShield } from 'react-icons/fi'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import { clothingItems, mockRentals } from '../../data/mockData'

export default function RentalDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const rental = mockRentals.find((r) => r.id === parseInt(id))
  const clothing = rental ? clothingItems.find((c) => c.id === rental.clothingId) : null

  const startDate = useMemo(() => new Date(rental?.startDate || ''), [rental])
  const returnDate = useMemo(() => new Date(rental?.returnDate || ''), [rental])
  const createdAt = useMemo(() => new Date(rental?.createdAt || ''), [rental])
  const duration = useMemo(
    () => Math.max(1, Math.ceil((returnDate - startDate) / (1000 * 60 * 60 * 24))),
    [startDate, returnDate]
  )

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!rental || !clothing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading mb-2">Rental Not Found</h2>
          <p className="text-text-light mb-4">The rental you're looking for doesn't exist.</p>
          <Link to="/rentals" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleAction = () => {
    if (rental.status === 'active') {
      alert('Return request submitted!')
    } else if (rental.status === 'upcoming') {
      alert('Rental cancelled!')
    }
  }

  const deposit = Math.max(50, rental.totalAmount * 0.2)

  const timeline = [
    { label: 'Booked', date: formatDate(createdAt), icon: FiCheckCircle, done: true },
    { label: 'Pickup', date: formatDate(startDate), icon: FiMapPin, done: rental.status !== 'upcoming' },
    { label: 'Return', date: formatDate(returnDate), icon: FiClock, done: rental.status === 'completed' },
  ]

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link to="/rentals" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-white">Rental #{rental.id}</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading">Rental Details</h1>
              <p className="text-gray-300 mt-1">Order #{rental.id}</p>
            </div>
            <StatusBadge status={rental.status} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold font-heading mb-4">Clothing Information</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <img
                  src={clothing.image}
                  alt={clothing.name}
                  className="w-full sm:w-48 h-64 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <span className="inline-block text-sm text-text-light bg-surface-alt px-3 py-1 rounded-full mb-2">
                    {clothing.category}
                  </span>
                  <h3 className="text-2xl font-bold font-heading mb-2">{clothing.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-accent">${clothing.price}</span>
                    <span className="text-text-light line-through">${clothing.originalPrice}</span>
                    <span className="text-text-light">/day</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-text-light">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-accent" />
                      <span>Rented for {duration} day{duration !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-accent" />
                      <span>Free shipping & returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold font-heading mb-4">Rental Timeline</h2>
              <div className="space-y-6">
                {timeline.map((event, index) => {
                  const Icon = event.icon
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${event.done ? 'bg-green-100 text-green-600' : 'bg-surface-alt text-text-muted'}`}>
                        <Icon className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${event.done ? 'text-text' : 'text-text-light'}`}>
                          {event.label}
                        </p>
                        <p className="text-sm text-text-light">{event.date}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold font-heading mb-4">Rental Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-text-muted text-xl" />
                  <div>
                    <p className="text-sm text-text-light">Start Date</p>
                    <p className="font-medium">{formatDate(startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiClock className="text-text-muted text-xl" />
                  <div>
                    <p className="text-sm text-text-light">Return Date</p>
                    <p className="font-medium">{formatDate(returnDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-text-muted text-xl" />
                  <div>
                    <p className="text-sm text-text-light">Duration</p>
                    <p className="font-medium">{duration} day{duration !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-text-light mb-2">Status</p>
                  <StatusBadge status={rental.status} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold font-heading mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCreditCard className="text-text-muted text-xl" />
                  <div>
                    <p className="text-sm text-text-light">Payment Status</p>
                    <StatusBadge status={rental.paymentStatus} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiDollarSign className="text-text-muted text-xl" />
                  <div>
                    <p className="text-sm text-text-light">Total Amount</p>
                    <p className="font-medium text-lg">${rental.totalAmount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiShield className="text-text-muted text-xl" />
                  <div>
                    <p className="text-sm text-text-light">Security Deposit</p>
                    <p className="font-medium">${deposit}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {rental.status === 'active' && (
                <Button variant="primary" size="lg" className="w-full" onClick={handleAction}>
                  Return Item
                </Button>
              )}
              {rental.status === 'upcoming' && (
                <Button variant="danger" size="lg" className="w-full" onClick={handleAction}>
                  Cancel Rental
                </Button>
              )}
              {rental.status === 'completed' && (
                <Button variant="outline" size="lg" className="w-full">
                  Rent Again
                </Button>
              )}
              <Link to="/rentals">
                <Button variant="ghost" size="lg" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
