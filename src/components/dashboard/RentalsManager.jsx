import { useMemo, useState } from 'react'
import { DataTable } from './StatCard'
import StatusBadge from '../common/StatusBadge'
import { SearchInput } from '../common/SearchBar'
import { rentals } from '../../data/rentals'
import { payments } from '../../data/payments'
import { products } from '../../data/products'
import { users } from '../../data/users'
import { formatINR } from '../../utils/priceUtils'
import { formatDate, parseISO, daysBetween, daysLabel } from '../../utils/dateUtils'

const STATUSES = ['All', 'Pending', 'Confirmed', 'Active', 'Returned', 'Cancelled']
const userName = (id) => users.find((u) => u.user_id === id)?.name || 'Customer'
const itemName = (id) => products.find((p) => p.clothing_id === id)?.name || '—'
const paymentFor = (id) => payments.find((p) => p.rental_id === id)

// Shared rentals table used by the Owner and Admin consoles.
export default function RentalsManager({ title = 'Rentals' }) {
  const [status, setStatus] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return rentals.filter((r) => {
      const statusOk = status === 'All' || r.status === status
      const nameOk =
        String(r.rental_id).includes(q) ||
        userName(r.user_id).toLowerCase().includes(q) ||
        itemName(r.items?.[0]?.clothing_id).toLowerCase().includes(q)
      return statusOk && nameOk
    })
  }, [status, query])

  return (
    <div className="card-sr p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">{title}</h5>
          <span className="text-muted-sr small">{filtered.length} bookings</span>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search bookings…" />
      </div>

      <div className="tab-row mb-3">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={`tab-chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
            {s}
          </button>
        ))}
      </div>

      <DataTable headers={['Booking', 'Customer', 'Item', 'Dates', 'Days', 'Amount', 'Payment', 'Status']}>
        {filtered.map((r) => {
          const pay = paymentFor(r.rental_id)
          return (
            <tr key={r.rental_id}>
              <td className="small text-muted-sr">#{r.rental_id}</td>
              <td className="small">{userName(r.user_id)}</td>
              <td className="small">{itemName(r.items?.[0]?.clothing_id)}</td>
              <td className="small text-nowrap">
                {formatDate(parseISO(r.start_date))} → {formatDate(parseISO(r.end_date))}
              </td>
              <td className="small">{daysLabel(daysBetween(parseISO(r.start_date), parseISO(r.end_date)))}</td>
              <td className="small fw-semibold">{formatINR(r.total_amount)}</td>
              <td className="small">{pay?.payment_status || '—'}</td>
              <td><StatusBadge status={r.status} type="rental" /></td>
            </tr>
          )
        })}
      </DataTable>
    </div>
  )
}