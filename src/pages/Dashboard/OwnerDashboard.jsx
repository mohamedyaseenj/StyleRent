import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiPackage, FiCalendar, FiDollarSign, FiPlus, FiList } from 'react-icons/fi'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import { clothingItems, mockRentals, mockUsers } from '../../data/mockData'

export default function OwnerDashboard() {
  const totalClothing = clothingItems.length
  const availableStock = clothingItems.filter((c) => c.available).length
  const activeRentals = mockRentals.filter((r) => r.status === 'active').length
  const revenue = mockRentals
    .filter((r) => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + r.totalAmount, 0)

  const getUser = (id) => mockUsers.find((u) => u.id === id)
  const getClothing = (id) => clothingItems.find((c) => c.id === id)

  const recentRentals = useMemo(() => {
    return [...mockRentals]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((rental) => ({
        ...rental,
        user: getUser(rental.userId),
        clothing: getClothing(rental.clothingId),
      }))
  }, [])

  const stats = [
    { title: 'Total Clothing', value: totalClothing, icon: FiShoppingBag, color: 'bg-accent' },
    { title: 'Available Stock', value: availableStock, icon: FiPackage, color: 'bg-green-500' },
    { title: 'Active Rentals', value: activeRentals, icon: FiCalendar, color: 'bg-blue-500' },
    { title: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: FiDollarSign, color: 'bg-gold' },
  ]

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-heading">Welcome back, Admin!</h1>
          <p className="text-gray-300 mt-2">Here's what's happening with your store today.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.title} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold font-heading">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card overflow-hidden mb-8">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-xl font-semibold font-heading">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Clothing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {recentRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#{rental.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{rental.user?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{rental.clothing?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {rental.startDate} - {rental.returnDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={rental.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">${rental.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold font-heading mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/dashboard/clothing">
              <Button className="w-full">
                <FiPlus className="mr-2" />
                Add New Clothing
              </Button>
            </Link>
            <Link to="/dashboard/inventory">
              <Button variant="secondary" className="w-full">
                <FiPackage className="mr-2" />
                Manage Inventory
              </Button>
            </Link>
            <Link to="/dashboard/bookings">
              <Button variant="outline" className="w-full">
                <FiList className="mr-2" />
                View All Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
