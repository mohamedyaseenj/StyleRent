import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useState } from 'react'

export default function FormInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required,
  disabled,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${error ? 'border-danger focus:ring-danger' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
