import { AlertCircle } from 'lucide-react'

// Label + control + unified error message. Supports input/select/textarea.
// All controls render a human-friendly validation message via `error`.
export default function FormInput({
  label,
  error,
  hint,
  type = 'text',
  as,
  children,
  className = '',
  ...rest
}) {
  const errorId = rest.id ? `${rest.id}-error` : undefined
  const controlProps = {
    'aria-invalid': !!error,
    'aria-describedby': error ? errorId : undefined,
    className: `sr-${as || 'input'}${error ? ' is-invalid' : ''}`,
    ...rest,
  }
  if (as === 'input' || !as) controlProps.type = type

  return (
    <div className={`mb-3 ${className}`}>
      {label ? (
        <label className="sr-form-label" htmlFor={rest.id}>
          {label}
          {rest.required ? <span className="text-danger"> *</span> : null}
        </label>
      ) : null}
      {as === 'select' ? <select {...controlProps}>{children}</select> : null}
      {as === 'textarea' ? (
        <textarea {...controlProps} />
      ) : as === 'input' || !as ? (
        <input {...controlProps} />
      ) : null}
      {hint && !error ? <div className="text-muted-sr small mt-1">{hint}</div> : null}
      {error ? (
        <div className="sr-error-text" id={errorId} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </div>
      ) : null}
    </div>
  )
}

export function QuantityStepper({ value, onChange, min = 1, max = 10, label = 'Quantity' }) {
  const clamp = (n) => Math.min(max, Math.max(min, n))
  return (
    <div>
      <span className="sr-form-label">{label}</span>
      <div className="d-inline-flex align-items-center border border-dark-subtle rounded" style={{ borderRadius: 'var(--radius-pill)!important' }}>
        <button
          type="button"
          className="btn px-3 py-2 border-0 bg-transparent fw-semibold"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="px-2 fw-semibold" aria-live="polite">{value}</span>
        <button
          type="button"
          className="btn px-3 py-2 border-0 bg-transparent fw-semibold"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  )
}