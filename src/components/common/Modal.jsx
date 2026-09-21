import { useEffect } from 'react'
import { X } from 'lucide-react'

// Accessible brand modal. Closes on backdrop click / Esc.
export default function Modal({ open, onClose, title, children, footer, size }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="sr-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className="sr-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        style={size === 'lg' ? { width: 'min(760px, 100%)' } : undefined}
      >
        <div className="modal-head">
          <h5>{title}</h5>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-body pt-0">{footer}</div> : null}
      </div>
    </div>
  )
}