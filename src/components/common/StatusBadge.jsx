// Consistent status badges for rental, payment and stock statuses.
const RENTAL_MAP = {
  Pending: 'status-pending',
  Confirmed: 'status-confirmed',
  Active: 'status-active',
  Returned: 'status-returned',
  Cancelled: 'status-cancelled',
}

const PAYMENT_MAP = {
  Pending: 'status-unpaid',
  Paid: 'status-paid',
  Failed: 'status-failed',
  Refunded: 'status-refunded',
}

const STOCK_MAP = {
  'In Stock': 'status-paid',
  'Low Stock': 'status-unpaid',
  'Out of Stock': 'status-failed',
}

const mapForType = (type) => {
  if (type === 'rental') return RENTAL_MAP
  if (type === 'payment') return PAYMENT_MAP
  if (type === 'stock') return STOCK_MAP
  return {}
}

export const stockLabel = (stock) => {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 5) return 'Low Stock'
  return 'In Stock'
}

export default function StatusBadge({ status, type = 'rental' }) {
  const map = mapForType(type)
  const label = type === 'stock' ? stockLabel(status === undefined ? -1 : status) : status
  const cls = type === 'stock' ? map[label] : map[status]
  return (
    <span className={`status-badge ${cls || 'status-confirmed'}`}>
      <span className="dot" aria-hidden="true" />
      {label}
    </span>
  )
}