import { FiX } from 'react-icons/fi'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className={`relative inline-block bg-white rounded-xl shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h3 className="text-lg font-semibold font-heading">{title}</h3>
            <button onClick={onClose} className="text-text-light hover:text-text transition-colors">
              <FiX className="text-xl" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
