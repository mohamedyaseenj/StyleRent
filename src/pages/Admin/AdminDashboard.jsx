import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiUserCheck, FiShoppingBag, FiCalendar, FiCheckCircle, FiDollarSign, FiAlertTriangle, FiTrash2, FiEdit, FiEye } from 'react-icons/fi'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import DataTable from '../../components/DataTable'
import { clothingItems, mockRentals, mockUsers } from '../../data/mockData'

export default function AdminDashboard() {
  const totalCustomers = mockUsers.filter((u) => u.role === 'customer').length
  const totalOwners = mockUsers.filter((u) => u.role === 'owner').length
  const totalClothing = clothingItems.length
  const activeRentals = mockRentals.filter((r) => r.status === 'active').length
  const completedRentals = mockRentals.filter((r) => r.status === 'completed').length
  const revenue = mockRentals
    .filter((r) => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + r.totalAmount, 0)
  const lowStockItems = clothingItems.filter((c) => !c.available).length

  const getUser = (id) => mockUsers.find((u) => u.id === id)

  const recentActivities = useMemo(() => {
    const activities = []

    mockUsers.forEach((user) => {
      if (user.role === 'customer') {
        activities.push({
          id: `user-${user.id}`,
          type: 'registration',
          message: `New customer registration: ${user.name}`,
          timestamp: '2026-08-10T10:00:00Z',
        })
      }
    })

    mockUsers.forEach((user) => {
      if (user.role === 'owner') {
        activities.push({
          id: `owner-${user.id}`,
          type: 'registration',
          message: `New owner registration: ${user.name}`,
          timestamp: '2026-08-08T14:30:00Z',
        })
      }
    })

    mockRentals.forEach((rental) => {
      const user = getUser(rental.userId)
      activities.push({
        id: `rental-${rental.id}`,
        type: 'rental',
        message: `${user?.name || 'Unknown'} created a new rental #${rental.id}`,
        timestamp: rental.createdAt,
      })
    })

    clothingItems.forEach((item) => {
      activities.push({
        id: `item-${item.id}`,
        type: 'clothing',
        message: `New clothing added: ${item.name}`,
        timestamp: '2026-08-01T09:00:00Z',
      })
    })

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8)
  }, [])

  const stats = [
    { title: 'Total Users', value: totalCustomers, icon: FiUsers, color: 'bg-accent' },
    { title: 'Total Owners', value: totalOwners, icon: FiUserCheck, color: 'bg-blue-500' },
    { title: 'Total Clothing', value: totalClothing, icon: FiShoppingBag, color: 'bg-purple-500' },
    { title: 'Active Rentals', value: activeRentals, icon: FiCalendar, color: 'bg-green-500' },
    { title: 'Completed Rentals', value: completedRentals, icon: FiCheckCircle, color: 'bg-gray-500' },
    { title: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: FiDollarSign, color: 'bg-gold' },
    { title: 'Low Stock Items', value: lowStockItems, icon: FiAlertTriangle, color: 'bg-orange-500' },
  ]

  const userColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val) => val.charAt(0).toUpperCase() + val.slice(1) },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, _row) => (
        <div className="flex items-center gap-2">
          <button className="text-accent hover:text-accent-hover" title="View">
            <FiEye />
          </button>
          <button className="text-blue-600 hover:text-blue-700" title="Edit">
            <FiEdit />
          </button>
          <button className="text-danger hover:text-red-700" title="Delete">
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ]

  const enrichedUsers = mockUsers.map((u) => ({
    ...u,
    status: u.role === 'admin' ? 'available' : 'active',
  }))

  const revenueData = [
    { month: 'Jan', value: 1200 },
    { month: 'Feb', value: 1800 },
    { month: 'Mar', value: 2400 },
    { month: 'Apr', value: 2100 },
    { month: 'May', value: 3200 },
    { month: 'Jun', value: 2800 },
    { month: 'Jul', value: 3500 },
    { month: 'Aug', value: revenue },
  ]

  const maxRevenue = Math.max(...revenueData.map((d) => d.value))

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-heading">Admin Dashboard</h1>
          <p className="text-gray-300 mt-2">Manage users, rentals, and platform analytics</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xl font-semibold font-heading">Recent Activities</h2>
            </div>
            <div className="divide-y divide-border">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'registration' && <FiUsers className="text-accent text-lg" />}
                    {activity.type === 'rental' && <FiCalendar className="text-blue-500 text-lg" />}
                    {activity.type === 'clothing' && <FiShoppingBag className="text-purple-500 text-lg" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{activity.message}</p>
                    <p className="text-xs text-text-light mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold font-heading mb-4">Revenue Overview</h2>
            <div className="flex items-end justify-between h-48 gap-2">
              {revenueData.map((item) => (
                <div key={item.month} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-accent rounded-t-md transition-all duration-300 hover:bg-accent-hover"
                    style={{ height: `${(item.value / maxRevenue) * 100}%` }}
                    title={`$${item.value.toLocaleString()}`}
                  />
                  <span className="text-xs text-text-light mt-2">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-light">Total Revenue</p>
              <p className="text-2xl font-bold font-heading text-accent">${revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden mb-8">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold font-heading">Users</h2>
            <Link to="/admin/users">
              <Button size="sm" variant="outline">View All Users</Button>
            </Link>
          </div>
          <DataTable columns={userColumns} data={enrichedUsers} emptyMessage="No users found" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xl font-semibold font-heading">Low Stock Products</h2>
            </div>
            <div className="divide-y divide-border">
              {clothingItems.filter((c) => !c.available).length === 0 ? (
                <div className="px-6 py-8 text-center text-text-light">No low stock items</div>
              ) : (
                clothingItems
                  .filter((c) => !c.available)
                  .map((item) => (
                    <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{item.name}</p>
                        <p className="text-xs text-text-light">{item.category}</p>
                      </div>
                      <StatusBadge status="out_of_stock" />
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xl font-semibold font-heading">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin/users">
                <Button className="w-full" variant="primary">
                  <FiUsers className="mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/clothing">
                <Button className="w-full" variant="secondary">
                  <FiShoppingBag className="mr-2" />
                  Manage Clothing
                </Button>
              </Link>
              <Link to="/admin/rentals">
                <Button className="w-full" variant="outline">
                  <FiCalendar className="mr-2" />
                  View Rentals
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button className="w-full" variant="gold">
                  <FiDollarSign className="mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
