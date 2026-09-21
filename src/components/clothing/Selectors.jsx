import { Check } from 'lucide-react'

// Pill-style size picker.
export default function SizeSelector({ sizes = [], value, onChange }) {
  if (!sizes.length) return null
  return (
    <div>
      <span className="sr-form-label">
        Select Size
        {value ? <span className="text-gold ms-1">· {value}</span> : null}
      </span>
      <div className="size-options">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`size-chip ${value === size ? 'active' : ''}`}
            onClick={() => onChange(size)}
            aria-pressed={value === size}
          >
            {size}
            {value === size ? <Check size={12} className="ms-1" aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

// Colour chips (single offering per product in the demo).
export function ColorSelector({ color, colorHex }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <span className="sr-form-label mb-0">Colour:</span>
      <span className="color-dot" style={{ background: colorHex }} title={color} aria-label={color} />
      <span style={{ fontFamily: 'var(--font-serif)' }}>{color}</span>
    </div>
  )
}