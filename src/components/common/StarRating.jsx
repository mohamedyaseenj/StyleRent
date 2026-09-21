import { Star } from 'lucide-react'

// Read-only star display. printable decimals, e.g. 4.7.
export default function StarRating({ rating = 0, size = 14, showValue = false }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.4 && rating - full < 0.95

  return (
    <span className="rating-line">
      <span className="stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const dim = i >= full && !(i === full && half)
          return (
            <Star
              key={i}
              size={size}
              className={dim ? 'dim' : ''}
              style={{ fill: dim ? 'transparent' : undefined }}
            />
          )
        })}
      </span>
      {showValue ? <b>{rating.toFixed(1)}</b> : null}
    </span>
  )
}

// Interactive clickable stars (for review forms).
export function StarInput({ value = 0, onChange, size = 28 }) {
  return (
    <div className="d-flex align-items-center gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="btn p-1 border-0 bg-transparent"
          style={{ lineHeight: 0 }}
          onClick={() => onChange(n)}
        >
          <Star
            size={size}
            style={{ fill: n <= value ? 'currentColor' : 'transparent' }}
            color={n <= value ? 'var(--color-gold)' : 'var(--color-border-dark)'}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}