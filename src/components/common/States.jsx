// Reusable page states: loading / empty / error / not-found.

export function LoadingSpinner({ label = 'Loading…', compact }) {
  return (
    <div
      className={compact ? 'text-center py-4' : 'text-center py-5'}
      role="status"
      aria-live="polite"
    >
      <span
        className="d-inline-block border-3 border-top border-dark rounded-circle spin"
        style={{ width: 34, height: 34 }}
        aria-hidden="true"
      />
      {label ? <p className="text-muted-sr mt-2 mb-0 small">{label}</p> : null}
    </div>
  )
}

export function ErrorMessage({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="sr-error" role="alert">
      <div className="error-icon mx-auto">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h4 className="fs-5 fw-semibold">Something went wrong</h4>
      <p>{message}</p>
      {onRetry ? (
        <button className="btn btn-sr-outline btn-sr-sm" type="button" onClick={onRetry}>
          Try Again
        </button>
      ) : null}
    </div>
  )
}

export function EmptyState({
  title = 'Nothing here yet',
  message,
  icon,
  action,
  children,
}) {
  return (
    <div className="sr-empty">
      <div className="empty-icon mx-auto">{icon}</div>
      <h4>{title}</h4>
      {message ? <p>{message}</p> : null}
      {action ? <div>{action}</div> : null}
      {children}
    </div>
  )
}

export function SkeletonCards({ count = 8 }) {
  return (
    <div className="row g-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3">
          <div className="skeleton rounded" style={{ aspectRatio: '3 / 4' }} />
          <div className="skeleton rounded mt-2" style={{ height: 16, width: '70%' }} />
          <div className="skeleton rounded mt-2" style={{ height: 14, width: '45%' }} />
        </div>
      ))}
    </div>
  )
}