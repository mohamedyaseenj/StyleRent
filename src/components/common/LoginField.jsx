import { AlertCircle } from 'lucide-react'

// Reference-style auth field: label + rounded input with a leading icon,
// a divider, and an optional trailing element (e.g. password visibility).
export default function LoginField({
  id,
  label,
  error,
  icon,
  trailing,
  ...rest
}) {
  const errorId = id ? `${id}-error` : undefined
  return (
    <div className="login-field">
      {label ? (
        <label className="login-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className={`login-control${error ? ' is-invalid' : ''}`}>
        {icon ? (
          <span className="login-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {icon ? <span className="login-divider" aria-hidden="true" /> : null}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {trailing ? <span className="login-trailing">{trailing}</span> : null}
      </div>
      {error ? (
        <div className="sr-error-text" id={errorId} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </div>
      ) : null}
    </div>
  )
}
