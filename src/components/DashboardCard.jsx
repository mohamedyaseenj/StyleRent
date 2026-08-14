import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi'

const iconMap = {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiShoppingBag,
}

export default function DashboardCard({ title, value, change, changeType, icon, color = 'bg-accent' }) {
  const IconComponent = iconMap[icon] || FiDollarSign
  
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-light mb-1">{title}</p>
          <p className="text-2xl font-bold font-heading">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <IconComponent className="text-white text-2xl" />
        </div>
      </div>
    </div>
  )
}
