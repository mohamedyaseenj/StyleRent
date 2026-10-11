import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Shirt, LayoutGrid, CalendarCheck2, IndianRupee, Star, ShieldCheck, ArrowRight } from 'lucide-react'
import StatCard, { DataTable } from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { users } from '../../data/users'
import { products } from '../../data/products'
import { categories } from '../../data/categories'
import { rentals } from '../../data/rentals'
import { payments } from '../../data/payments'
import { reviews } from '../../data/reviews'
import { formatINR } from '../../utils/priceUtils'
import { formatDate, parseISO } from '../../utils/dateUtils'

export default function AdminDashboard() {
  const stats = useMemo(() => {
    const revenue = payments
      .filter((p) => p.payment_status === 'Paid')
      .reduce((s, p) => s + p.amount, 0)
    const roleCounts = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, {})
    return { revenue, roleCounts }
  }, [])

  const recent = [...rentals]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 6)

  const quickLinks = [
    { to: '/admin/clothing', label: 'Manage Clothing', icon: Shirt },
    { to: '/admin/categories', label: 'Manage Categories', icon: LayoutGrid },
    { to: '/admin/rentals', label: 'All Rentals', icon: CalendarCheck2 },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/payments', label: 'Payments', icon: CalendarCheck2 },
    { to: '/admin/reviews', label: 'Review Moderation', icon: Star },
  ]

  return (
    <div>
      <div className="alert alert-dark d-flex align-items-center gap-2 small" role="note">
        <ShieldCheck size={16} aria-hidden="true" />
        You are signed in with full administrative access to the StyleRent platform.
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard label="Total Users" value={users.length} icon={Users} sub={`${stats.roleCounts.USER || 0} customers`} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Listings" value={products.length} icon={Shirt} sub={`${categories.length} categories`} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Rentals" value={rentals.length} icon={CalendarCheck2} trend="+12%" good sub="all time" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Revenue" value={formatINR(stats.revenue)} icon={IndianRupee} sub="settled payments" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card-sr p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Recent Platform Activity</h5>
              <Link to="/admin/rentals" className="link-gold small d-flex align-items-center gap-1">
                View all <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
            <DataTable headers={['Booking', 'User', 'Amount', 'Created', 'Status']}>
              {recent.map((r) => {
                const u = users.find((x) => x.user_id === r.user_id)
                return (
                  <tr key={r.rental_id}>
                    <td className="small text-muted-sr">#{r.rental_id}</td>
                    <td className="small">{u?.name || '—'}</td>
                    <td className="small fw-semibold">{formatINR(r.total_amount)}</td>
                    <td className="small text-nowrap">{formatDate(parseISO(r.created_at))}</td>
                    <td><StatusBadge status={r.status} type="rental" /></td>
                  </tr>
                )
              })}
            </DataTable>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card-sr p-3 p-md-4 mb-4">
            <h5 className="mb-3">Users by Role</h5>
            {Object.entries(stats.roleCounts).map(([role, count]) => (
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={role}>
                <span className="small">{role}</span>
                <span className="badge-soft">{count}</span>
              </div>
            ))}
            <div className="text-muted-sr small mt-3">
              {reviews.length} reviews across {products.length} listings.
            </div>
          </div>

          <div className="card-sr p-3 p-md-4">
            <h5 className="mb-3">Quick Links</h5>
            {quickLinks.map((l) => (
              <Link key={l.to} to={l.to} className="d-flex align-items-center gap-2 py-2 text-decoration-none text-dark small border-bottom">
                <l.icon size={16} aria-hidden="true" /> {l.label}
                <ArrowRight size={13} className="ms-auto" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}