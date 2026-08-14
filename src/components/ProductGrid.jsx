import ProductCard from './ProductCard'
import EmptyState from './EmptyState'
import { FiSearch } from 'react-icons/fi'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="bg-gray-200 h-64 rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="bg-gray-200 h-4 rounded w-3/4" />
              <div className="bg-gray-200 h-4 rounded w-1/2" />
              <div className="bg-gray-200 h-6 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No clothing found"
        description="Try adjusting your search or filter criteria."
        icon={FiSearch}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
