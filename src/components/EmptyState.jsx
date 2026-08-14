import { FiInbox, FiShoppingBag, FiSearch } from 'react-icons/fi'

export default function EmptyState({ 
  title = 'No items found', 
  description = 'Try adjusting your search or filter criteria.',
  icon: Icon = FiInbox,
  action,
  actionLabel
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-surface-alt rounded-full p-6 mb-4">
        <Icon className="text-5xl text-text-muted" />
      </div>
      <h3 className="text-xl font-semibold font-heading mb-2">{title}</h3>
      <p className="text-text-light max-w-md mb-6">{description}</p>
      {action && actionLabel && (
        <button onClick={action} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
