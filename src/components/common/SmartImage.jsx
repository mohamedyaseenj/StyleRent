import { useState } from 'react'
import { Shirt } from 'lucide-react'

// Image component with graceful fallback + lazy loading + object-fit cover.
// If the remote file fails, a premium StyleRent placeholder is shown instead
// of a broken image icon.
export default function SmartImage({ src, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false)

  const imageSrc = failed ? null : src

  if (failed || !src) {
    return (
      <div
        className={`d-flex align-items-center justify-content-center ${className}`}
        style={{
          background:
            'linear-gradient(150deg, var(--color-beige) 0%, var(--color-ivory) 60%)',
          color: 'var(--color-gold-deep)',
        }}
        role="img"
        aria-label={alt || 'StyleRent placeholder'}
      >
        <Shirt size={40} aria-hidden="true" />
        <span
          className="position-absolute"
          style={{
            bottom: 10,
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
          }}
        >
          STYLERENT
        </span>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}