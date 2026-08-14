import { Link } from 'react-router-dom'
import { FiHeart, FiStar } from 'react-icons/fi'
import StatusBadge from './StatusBadge'

export default function ProductCard({ product }) {
  return (
    <div className="card group">
      <div className="relative overflow-hidden">
        <Link to={`/catalog/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="absolute top-3 left-3">
          <StatusBadge status={product.available ? 'available' : 'out_of_stock'} />
        </div>
        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
          <FiHeart className="text-text-light" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-text-light uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/catalog/${product.id}`}>
          <h3 className="font-semibold font-heading mb-2 hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <FiStar className="text-gold fill-current" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-text-light">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-accent">${product.price}</span>
            <span className="text-sm text-text-light line-through ml-2">${product.originalPrice}</span>
            <p className="text-xs text-text-light">/rental</p>
          </div>
        </div>
      </div>
    </div>
  )
}
