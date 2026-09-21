import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Shirt, CalendarCheck2, IndianRupee, Star, Plus, ArrowRight } from 'lucide-react'
import StatCard, { DataTable } from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import SmartImage from '../../components/common/SmartImage'
import { rentals } from '../../data/rentals'
import { payments } from '../../data/payments'
import { products } from '../../data/products'
import { reviews } from '../../data/reviews'
import { users } from '../../data/users'
import { formatINR } from '../../utils/priceUtils'
import { formatDate, parseISO } from '../../utils/dateUtils'

const userName = (id) => users.find((u) => u.user_id === id)?.name || 'Customer'
const productById = (id) => products.find((p) => p.clothing_id === id)

export default function OwnerDashboard() {
  const stats = useMemo(() => {
    const revenue = payments
      .filter((p) => p.payment_status === 'Paid')
      .reduce((s, p) => s + p.amount, 0)
    const avgRating =
      reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)
    return { revenue, avgRating }
  }, [])

  // Top performers by number of rental items.
  const topProducts = useMemo(() => {
    const counts = {}
    rentals.forEach((r) => r.items?.forEach((it) => {
      counts[it.clothing_id] = (counts[it.clothing_id] || 0) + it.quantity
    }))
    return Object.entries(counts)
      .map(([id, qty]) => ({ product: productById(Number(id)), qty }))
      .filter((x) => x.product)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [])

  const recent = [...rentals]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 6)

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard label="Active Listings" value={products.length} icon={Shirt} sub="in your catalogue" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Total Rentals" value={rentals.length} icon={CalendarCheck2} trend="+12%" good sub="vs last month" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Revenue" value={formatINR(stats.revenue)} icon={IndianRupee} trend="+8%" good sub="paid orders" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Avg Rating" value={stats.avgRating.toFixed(2)} icon={Star} sub={`${reviews.length} reviews`} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card-sr p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Recent Rentals</h5>
              <Link to="/owner/rentals" className="link-gold small d-flex align-items-center gap-1">
                View all <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
            <DataTable headers={['Booking', 'Customer', 'Item', 'Dates', 'Amount', 'Status']}>
              {recent.map((r) => {
                const item = productById(r.items?.[0]?.clothing_id)
                return (
                  <tr key={r.rental_id}>
                    <td className="small text-muted-sr">#{r.rental_id}</td>
                    <td className="small">{userName(r.user_id)}</td>
                    <td className="small">{item?.name || '—'}</td>
                    <td className="small text-nowrap">
                      {formatDate(parseISO(r.start_date))}
                    </td>
                    <td className="small fw-semibold">{formatINR(r.total_amount)}</td>
                    <td><StatusBadge status={r.status} type="rental" /></td>
                  </tr>
                )
              })}
            </DataTable>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card-sr p-3 p-md-4 mb-4">
            <h5 className="mb-3">Top Performers</h5>
            {topProducts.map(({ product, qty }) => (
              <div className="d-flex align-items-center gap-3 py-2 border-bottom" key={product.clothing_id}>
                <div className="rounded overflow-hidden flex-shrink-0" style={{ width: 44, height: 56 }}>
                  <SmartImage src={product.image_url} alt={product.name} className="w-100 h-100" />
                </div>
                <div className="flex-grow-1 text-truncate">
                  <strong className="d-block small text-truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                    {product.name}
                  </strong>
                  <span className="text-muted-sr" style={{ fontSize: 12 }}>{qty} rented</span>
                </div>
                <span className="small fw-semibold">{formatINR(product.price_per_day)}</span>
              </div>
            ))}
          </div>

          <div className="card-sr p-3 p-md-4">
            <h5 className="mb-3">Quick Actions</h5>
            <Link to="/owner/clothing" className="btn btn-sr-primary btn-sr-block btn-sr-sm mb-2 d-flex align-items-center justify-content-center gap-2">
              <Plus size={15} aria-hidden="true" /> Add New Listing
            </Link>
            <Link to="/owner/rentals" className="btn btn-sr-outline btn-sr-block btn-sr-sm">
              Manage Rentals
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}