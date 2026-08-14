export default function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    available: 'bg-green-100 text-green-800',
    low_stock: 'bg-yellow-100 text-yellow-800',
    out_of_stock: 'bg-red-100 text-red-800',
  }

  const labels = {
    active: 'Active',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    available: 'Available',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}
