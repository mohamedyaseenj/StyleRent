import { useMemo, useState } from 'react'
import { DataTable } from '../../components/dashboard/StatCard'
import { SearchInput } from '../../components/common/SearchBar'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { users } from '../../data/users'
import { rentals } from '../../data/rentals'
import { formatINR } from '../../utils/priceUtils'
import { formatDate, parseISO } from '../../utils/dateUtils'

const ROLE_BADGE = { USER: 'status-confirmed', OWNER: 'status-pending', ADMIN: 'status-paid' }

export default function AdminCustomers() {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [viewUser, setViewUser] = useState(null)

  const enriched = useMemo(
    () =>
      users.map((u) => {
        const mine = rentals.filter((r) => r.user_id === u.user_id)
        const spent = mine
          .filter((r) => r.status !== 'Cancelled')
          .reduce((s, r) => s + Number(r.total_amount || 0), 0)
        return { ...u, rentals: mine.length, spent }
      }),
    [],
  )

  const filtered = enriched.filter((u) => {
    const q = query.toLowerCase()
    const matchQ =
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    return matchQ && matchRole
  })

  const userRentals = viewUser ? rentals.filter((r) => r.user_id === viewUser.user_id) : []

  return (
    <div className="card-sr p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">Customers</h5>
          <span className="text-muted-sr small">{filtered.length} users</span>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search name or email…" />
      </div>

      <div className="tab-row mb-3">
        {['All', 'USER', 'OWNER', 'ADMIN'].map((r) => (
          <button key={r} type="button" className={`tab-chip ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>
            {r}
          </button>
        ))}
      </div>

      <DataTable headers={['User', 'Contact', 'Role', 'Rentals', 'Lifetime Value', 'Joined', '']}>
        {filtered.map((u) => (
          <tr key={u.user_id}>
            <td>
              <div className="d-flex align-items-center gap-2">
                <span className="avatar-sr" aria-hidden="true">{u.name.charAt(0)}</span>
                <span className="small fw-semibold">{u.name}</span>
              </div>
            </td>
            <td className="small">
              <span className="d-block">{u.email}</span>
              <span className="text-muted-sr">{u.phone}</span>
            </td>
            <td>
              <span className={`status-badge ${ROLE_BADGE[u.role]}`}>
                <span className="dot" aria-hidden="true" />
                {u.role}
              </span>
            </td>
            <td className="small">{u.rentals}</td>
            <td className="small fw-semibold">{formatINR(u.spent)}</td>
            <td className="small text-nowrap">{formatDate(parseISO(u.created_at))}</td>
            <td className="text-end">
              <Button variant="outline" size="sm" onClick={() => setViewUser(u)}>View</Button>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={viewUser?.name || 'Customer'}>
        {viewUser ? (
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="avatar-sr avatar-lg" aria-hidden="true">{viewUser.name.charAt(0)}</span>
              <div className="small">
                <span className="d-block"><strong>{viewUser.email}</strong></span>
                <span className="text-muted-sr d-block">{viewUser.phone}</span>
                <span className="text-muted-sr d-block">{viewUser.address}</span>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-4">
                <div className="mini-metric">
                  <strong>{viewUser.rentals}</strong>
                  <span>Rentals</span>
                </div>
              </div>
              <div className="col-4">
                <div className="mini-metric">
                  <strong>{formatINR(viewUser.spent)}</strong>
                  <span>Spent</span>
                </div>
              </div>
              <div className="col-4">
                <div className="mini-metric">
                  <strong>{viewUser.role}</strong>
                  <span>Role</span>
                </div>
              </div>
            </div>
            <h6>Booking History</h6>
            {userRentals.length === 0 ? (
              <p className="text-muted-sr small mb-0">No bookings yet.</p>
            ) : (
              userRentals.map((r) => (
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={r.rental_id}>
                  <span className="small">#{r.rental_id} · {formatDate(parseISO(r.start_date))}</span>
                  <span className="d-flex align-items-center gap-2">
                    <span className="small fw-semibold">{formatINR(r.total_amount)}</span>
                    <StatusBadge status={r.status} type="rental" />
                  </span>
                </div>
              ))
            )}
          </>
        ) : null}
      </Modal>
    </div>
  )
}