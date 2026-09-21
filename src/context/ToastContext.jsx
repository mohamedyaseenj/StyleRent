import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

let toastSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = ++toastSeq
      setToasts((list) => [...list.slice(-3), { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), 3600)
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      success: (m) => showToast(m, 'success'),
      error: (m) => showToast(m, 'error'),
      info: (m) => showToast(m, 'info'),
      show: showToast,
    }),
    [showToast],
  )

  const icons = {
    success: <CheckCircle2 size={18} aria-hidden="true" />,
    error: <AlertTriangle size={18} aria-hidden="true" />,
    info: <Info size={18} aria-hidden="true" />,
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-sr toast-${toast.type || 'info'}`}>
            <span className="toast-icon">{icons[toast.type] || icons.info}</span>
            <span>{toast.message}</span>
            <button
              type="button"
              className="btn btn-link p-0 ms-auto text-white opacity-75"
              style={{ fontSize: 14, textDecoration: 'none' }}
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}