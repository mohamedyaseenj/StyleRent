import { useMemo } from 'react'
import { IndianRupee, TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import StatCard, { DataTable } from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { payments } from '../../data/payments'
import { rentals } from '../../data/rentals'
import { users } from '../../data/users'
import { formatINR } from '../../utils/priceUtils'
import { formatDate, parseISO } from '../../utils/dateUtils'

const userName = (id) => users.find((u) => u.user_id === id)?.name || 'Customer'
const rentalOf = (id) => rentals.find((r) => r.rental_id === id)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function OwnerRevenue() {
  const summary = useMemo(() => {
    const paid = payments.filter((p) => p.payment_status === 'Paid')
    const pending = payments.filter((p) => p.payment_status === 'Pending')
    const refunded = payments.filter((p) => p.payment_status === 'Refunded')
    const total = paid.reduce((s, p) => s + p.amount, 0)
    const avg = paid.length ? total / paid.length : 0

    const byMonth = {}
    paid.forEach((p) => {
      if (!p.payment_date) return
      const d = parseISO(p.payment_date)
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      byMonth[key] = (byMonth[key] || 0) + p.amount
    })

    return {
      total,
      avg,
      pending: pending.reduce((s, p) => s + p.amount, 0),
      refunded: refunded.reduce((s, p) => s + p.amount, 0),
      byMonth: Object.entries(byMonth),
    }
  }, [])

  const maxMonth = Math.max(...summary.byMonth.map(([, v]) => v), 1)
  const sorted = [...payments].sort((a, b) =>
    String(b.payment_date || '').localeCompare(String(a.payment_date || '')),
  )

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard label="Total Revenue" value={formatINR(summary.total)} icon={IndianRupee} trend="+8%" good sub="paid orders" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Avg Order Value" value={formatINR(Math.round(summary.avg))} icon={TrendingUp} sub="per paid booking" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Pending" value={formatINR(summary.pending)} icon={Wallet} sub="awaiting payment" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Refunded" value={formatINR(summary.refunded)} icon={AlertCircle} good={false} sub="cancellations" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="card-sr p-3 p-md-4 h-100">
            <h5 className="mb-4">Monthly Revenue</h5>
            {summary.byMonth.length === 0 ? (
              <p className="text-muted-sr small mb-0">No revenue recorded yet.</p>
            ) : (
              summary.byMonth.map(([month, value]) => (
                <div className="mb-3" key={month}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{month}</span>
                    <strong>{formatINR(value)}</strong>
                  </div>
                  <div className="rev-bar-track">
                    <div className="rev-bar-fill" style={{ width: `${(value / maxMonth) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-xl-7">
          <div className="card-sr p-3 p-md-4">
            <h5 className="mb-3">Payment Ledger</h5>
            <DataTable headers={['Payment', 'Booking', 'Customer', 'Method', 'Date', 'Amount', 'Status']}>
              {sorted.map((p) => {
                const rental = rentalOf(p.rental_id)
                return (
                  <tr key={p.payment_id}>
                    <td className="small text-muted-sr">#{p.payment_id}</td>
                    <td className="small text-muted-sr">#{p.rental_id}</td>
                    <td className="small">{rental ? userName(rental.user_id) : '—'}</td>
                    <td className="small">{p.payment_method}</td>
                    <td className="small text-nowrap">{p.payment_date ? formatDate(parseISO(p.payment_date)) : '—'}</td>
                    <td className="small fw-semibold">{formatINR(p.amount)}</td>
                    <td>
                      <StatusBadge status={p.payment_status} type="payment" />
                    </td>
                  </tr>
                )
              })}
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  )
}