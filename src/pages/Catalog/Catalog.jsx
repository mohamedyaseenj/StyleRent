import { useState, useEffect, useMemo } from 'react'
import { FiSliders, FiX } from 'react-icons/fi'
import SearchBar from '../../components/SearchBar'
import FilterPanel from '../../components/FilterPanel'
import ProductGrid from '../../components/ProductGrid'
import { clothingItems } from '../../data/mockData'

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const itemsPerPage = 8

  const categories = [...new Set(clothingItems.map((c) => c.category))]
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = [...new Set(clothingItems.flatMap((c) => c.colors))]
  const priceRange = useMemo(() => [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $150', min: 100, max: 150 },
    { label: 'Over $150', min: 150, max: Infinity },
  ], [])

  const [filters, setFilters] = useState({
    category: '',
    size: '',
    color: '',
    priceRange: '',
    availableOnly: false,
  })

  const [filteredItems, setFilteredItems] = useState(clothingItems)

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    let filtered = [...clothingItems]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      )
    }

    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category)
    }

    if (filters.size) {
      filtered = filtered.filter((item) => item.sizes.includes(filters.size))
    }

    if (filters.color) {
      filtered = filtered.filter((item) => item.colors.includes(filters.color))
    }

    if (filters.priceRange) {
      const range = priceRange.find((r) => r.label === filters.priceRange)
      if (range) {
        filtered = filtered.filter(
          (item) => item.price >= range.min && item.price < range.max
        )
      }
    }

    if (filters.availableOnly) {
      filtered = filtered.filter((item) => item.available)
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => b.id - a.id)
        break
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    setFilteredItems(filtered)
    setCurrentPage(1)
  }, [searchQuery, filters, sortBy, priceRange])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const FilterSidebar = () => (
    <FilterPanel
      filters={filters}
      onFilterChange={handleFilterChange}
      categories={categories}
      sizes={sizes}
      colors={colors}
      priceRange={priceRange}
    />
  )

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-heading mb-2">Our Collection</h1>
          <p className="text-gray-300 text-lg">
            Discover our curated selection of premium clothing available for rent
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, category, or description..."
          />
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-text-light">
                Showing {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden btn-outline flex items-center gap-2"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <FiSliders />
                  <span>Filters</span>
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input py-2 px-4 w-48"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price Low-High</option>
                  <option value="price-high">Price High-Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            <ProductGrid products={paginatedItems} />

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? 'bg-accent text-white'
                        : 'bg-white border border-border hover:border-accent'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold font-heading">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
