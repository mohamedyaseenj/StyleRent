import { useState, useMemo } from 'react'
import { FiPackage, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi'
import SearchBar from '../../components/SearchBar'
import StatusBadge from '../../components/StatusBadge'
import { clothingItems, mockRentals } from '../../data/mockData'

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const inventory = useMemo(() => {
    return clothingItems.map((item) => {
      const totalStock = 10 + item.id * 3
      const rented = mockRentals.filter((r) => r.clothingId === item.id && r.status === 'active').length
      const available = totalStock - rented
      const status = available === 0 ? 'out_of_stock' : available < 3 ? 'low_stock' : 'available'
      return { ...item, totalStock, rented, available, status }
    })
  }, [])

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      const matchesStatus = !statusFilter || item.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [inventory, search, categoryFilter, statusFilter])

  const totalStock = inventory.reduce((sum, item) => sum + item.totalStock, 0)
  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0)
  const totalRented = inventory.reduce((sum, item) => sum + item.rented, 0)
  const lowStockCount = inventory.filter((item) => item.status === 'low_stock').length

  const categories = useMemo(() => {
    const cats = new Set(inventory.map((i) => i.category))
    return Array.from(cats)
  }, [inventory])

  const sizeBreakdown = useMemo(() => {
    const map = {}
    inventory.forEach((item) => {
      if (item.available > 0) {
        item.sizes.forEach((size) => {
          map[size] = (map[size] || 0) + item.available
        })
      }
    })
    return map
  }, [inventory])

  const colorBreakdown = useMemo(() => {
    const map = {}
    inventory.forEach((item) => {
      if (item.available > 0) {
        item.colors.forEach((color) => {
          map[color] = (map[color] || 0) + item.available
        })
      }
    })
    return map
  }, [inventory])

  const stats = [
    { title: 'Total Stock', value: totalStock, icon: FiPackage, color: 'bg-accent' },
    { title: 'Available', value: totalAvailable, icon: FiCheckCircle, color: 'bg-green-500' },
    { title: 'Rented', value: totalRented, icon: FiClock, color: 'bg-blue-500' },
    { title: 'Low Stock', value: lowStockCount, icon: FiAlertTriangle, color: 'bg-gold' },
  ]

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-heading">Inventory Management</h1>
          <p className="text-gray-300 mt-2">Track stock levels and availability across your wardrobe</p>
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

        <div className="card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <SearchBar value={search} onChange={setSearch} placeholder="Search inventory..." />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input py-2 w-auto"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input py-2 w-auto"
              >
                <option value="">All Status</option>
                <option value="available">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden mb-8">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-xl font-semibold font-heading">Stock Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Clothing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Total Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Rented</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{item.totalStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{item.available}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{item.rented}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold font-heading mb-4">Size-wise Stock Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(sizeBreakdown).map(([size, count]) => (
                <div key={size} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">{size}</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="flex-1 h-2 bg-surface-alt rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${Math.min(100, (count / totalStock) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-text-light w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold font-heading mb-4">Color-wise Stock Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(colorBreakdown).map(([color, count]) => (
                <div key={color} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">{color}</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="flex-1 h-2 bg-surface-alt rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${Math.min(100, (count / totalStock) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-text-light w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
