import ProductCard from './ProductCard'
import { EmptyState } from '../common/States'

// Responsive product grid: 2 cols mobile → 4 cols desktop.
export default function ProductGrid({ products = [], emptyTitle, emptyMessage }) {
  if (!products.length) {
    return (
      <EmptyState
        title={emptyTitle || 'No pieces match your search'}
        message={
          emptyMessage ||
          'Try adjusting your filters or search terms to discover more looks from the collection.'
        }
        icon={<ShirtIcon />}
      />
    )
  }

  return (
    <div className="row g-3 g-lg-4">
      {products.map((product) => (
        <div className="col-6 col-md-4 col-lg-3" key={product.clothing_id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}

function ShirtIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  )
}