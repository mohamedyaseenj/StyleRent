import { TrendingUp, TrendingDown } from 'lucide-react'

// Metric card used across owner/admin overviews.
export default function StatCard({ label, value, sub, icon: Icon, trend, good }) {
  return (
    <div className="stat-card h-100">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <p className="stat-label mb-1">{label}</p>
          <p className="stat-value mb-0">{value}</p>
        </div>
        {Icon ? (
          <span className="stat-icon">
            <Icon size={20} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="d-flex align-items-center gap-2 mt-2">
        {trend ? (
          <span className={`trend-tag ${good === false ? 'down' : ''}`}>
            {good === false ? <TrendingDown size={13} aria-hidden="true" /> : <TrendingUp size={13} aria-hidden="true" />}
            {trend}
          </span>
        ) : null}
        <span className="stat-sub">{sub}</span>
      </div>
    </div>
  )
}

// Reusable dashboard data table wrapper.
export function DataTable({ headers, children, empty = 'No data to show.' }) {
  return (
    <div className="table-responsive dtable">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!children.length ? (
        <div className="text-center py-5 text-muted-sr small">{empty}</div>
      ) : null}
    </div>
  )
}

// Small empty-state help for dashboards.
export function DashEmpty({ title, message }) {
  return (
    <div className="text-center py-5">
      <p className="fw-semibold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{title}</p>
      <p className="text-muted-sr small mb-0">{message}</p>
    </div>
  )
}