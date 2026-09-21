import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import SmartImage from '../components/common/SmartImage'
import Breadcrumbs from '../components/common/SearchBar'
import ProductGrid from '../components/clothing/ProductGrid'
import { SkeletonCards, ErrorMessage } from '../components/common/States'
import { categoryAPI, clothingAPI } from '../services/api'
import { withCategoryNames, applyFilters } from '../utils/productUtils'

export default function CategoryProducts() {
  const { id } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([categoryAPI.getById(id), clothingAPI.getAll({ category_id: id })])
      .then(([cat, items]) => {
        if (!active) return
        setCategory(cat)
        setProducts(withCategoryNames(items))
      })
      .catch(() => active && setError('This category could not be found.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  // A category banner image + rich header, then the curated list.
  const filtered = useMemo(() => applyFilters(products, { sort: 'popular' }), [products])

  if (loading) {
    return <div className="container section-space"><SkeletonCards count={8} /></div>
  }

  if (error || !category) {
    return (
      <div className="container section-space py-5">
        <ErrorMessage message={error || 'Category unavailable.'} />
      </div>
    )
  }

  return (
    <div>
      <div className="category-hero position-relative overflow-hidden">
        <SmartImage src={category.image_url} alt={category.category_name} className="w-100 h-100" />
        <div className="category-hero-overlay" />
        <div className="container category-hero-inner">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories', to: '/categories' }, { label: category.category_name }]} />
          <h1 className="page-title text-white">{category.category_name}</h1>
          <p className="text-white-50">{category.description}</p>
          <p className="kicker text-white-50 mb-0">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} available to rent
          </p>
        </div>
      </div>
      <div className="container section-space">
        <ProductGrid
          products={filtered}
          emptyTitle={`No ${category.category_name} right now`}
          emptyMessage="The collection will be updated soon — explore other categories in the meantime."
        />
      </div>
    </div>
  )
}