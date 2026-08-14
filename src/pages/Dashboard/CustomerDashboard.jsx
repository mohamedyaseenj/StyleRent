import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiCalendar, FiDollarSign, FiHeart } from 'react-icons/fi'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import { useAuth } from '../../context/AuthContext'
import { clothingItems, mockRentals } from '../../data/mockData'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('active')

  const userRentals = mockRentals.filter((r) => r.userId === user?.id)

  const activeRentals = userRentals.filter((r) => r.status === 'active' || r.status === 'upcoming')
  const rentalHistory = userRentals.filter((r) => r.status === 'completed' || r.status === 'cancelled')

  const totalSpent = userRentals
    .filter((r) => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + r.totalAmount, 0)

  const getClothing = (id) => clothingItems.find((c) => c.id === id)

  const tabs = [
    { key: 'active', label: 'Active Rentals', count: activeRentals.length },
    { key: 'history', label: 'Rental History', count: rentalHistory.length },
    { key: 'wishlist', label: 'Wishlist', count: 0 },
  ]

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-heading">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-300 mt-2">Manage your rentals and account</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-light mb-1">Active Rentals</p>
                <p className="text-3xl font-bold font-heading">{activeRentals.length}</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <FiPackage className="text-accent text-2xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-light mb-1">Upcoming Returns</p>
                <p className="text-3xl font-bold font-heading">
                  {userRentals.filter((r) => r.status === 'active').length}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <FiCalendar className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-light mb-1">Total Spent</p>
                <p className="text-3xl font-bold font-heading">${totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <FiDollarSign className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-light mb-1">Wishlist</p>
                <p className="text-3xl font-bold font-heading">0</p>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg">
                <FiHeart className="text-pink-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-border">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.key
                      ? 'text-accent'
                      : 'text-text-light hover:text-text'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-surface-alt px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeRentals.length === 0 ? (
                  <EmptyState
                    title="No active rentals"
                    description="You don't have any active rentals. Browse our catalog to find something you love."
                    icon={FiPackage}
                    actionLabel="Browse Catalog"
                    action={() => {}}
                  />
                ) : (
                  activeRentals.map((rental) => {
                    const clothing = getClothing(rental.clothingId)
                    if (!clothing) return null
                    return (
                      <div
                        key={rental.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <img
                          src={clothing.image}
                          alt={clothing.name}
                          className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold font-heading text-lg">{clothing.name}</h3>
                              <p className="text-sm text-text-light">{clothing.category}</p>
                            </div>
                            <StatusBadge status={rental.status} />
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-light">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="text-text-muted" />
                              {rental.startDate} - {rental.returnDate}
                            </span>
                            <span>${rental.totalAmount}</span>
                          </div>
                          <div className="mt-3">
                            <Link to={`/rentals/${rental.id}`} className="text-accent text-sm font-medium hover:underline">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {rentalHistory.length === 0 ? (
                  <EmptyState
                    title="No rental history"
                    description="Your completed rentals will appear here."
                    icon={FiCalendar}
                  />
                ) : (
                  rentalHistory.map((rental) => {
                    const clothing = getClothing(rental.clothingId)
                    if (!clothing) return null
                    return (
                      <div
                        key={rental.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <img
                          src={clothing.image}
                          alt={clothing.name}
                          className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold font-heading text-lg">{clothing.name}</h3>
                              <p className="text-sm text-text-light">{clothing.category}</p>
                            </div>
                            <StatusBadge status={rental.status} />
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-light">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="text-text-muted" />
                              {rental.startDate} - {rental.returnDate}
                            </span>
                            <span>${rental.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <EmptyState
                title="Your wishlist is empty"
                description="Save items you love to your wishlist and come back to rent them later."
                icon={FiHeart}
                actionLabel="Browse Catalog"
                action={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
