import { Loader2 } from 'lucide-react'

// Unified brand button. Variants map to the CSS design system.
const VARIANTS = {
  primary: 'btn-sr-primary',
  gold: 'btn-sr-gold',
  outline: 'btn-sr-outline',
  ghost: 'btn-sr-ghost',
  light: 'btn-sr-light',
}

export default function Button({
  variant = 'primary',
  size,
  block,
  loading,
  icon: Icon,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    VARIANTS[variant] || VARIANTS.primary,
    size === 'sm' ? 'btn-sr-sm' : '',
    size === 'lg' ? 'btn-sr-lg' : '',
    block ? 'btn-sr-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      disabled={rest.disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="spin" aria-hidden="true" />
          {children}
        </>
      ) : (
        <>
          {Icon ? <Icon size={16} aria-hidden="true" /> : null}
          {children}
        </>
      )}
    </button>
  )
}