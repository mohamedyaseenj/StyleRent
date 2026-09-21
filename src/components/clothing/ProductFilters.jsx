import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react'
import { categories as allCategories } from '../../data/categories'
import { formatINR } from '../../utils/priceUtils'

const GENDERS = ['Women', 'Men', 'Kids']

// Sidebar / collapsible filter panel. Values are lifted to the page state.
export default function ProductFilters({ state, onChange, resultCount, onReset }) {
  const { query, categoryId, gender, minPrice, maxPrice, sort, trending } = state
  const activeCount =
    (categoryId ? 1 : 0) +
    (gender ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (trending ? 1 : 0) +
    (query ? 1 : 0)

  const set = (patch) => onChange({ ...state, ...patch })

  return (
    <aside className="filter-panel">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="d-flex align-items-center gap-2 mb-0">
          <SlidersHorizontal size={16} aria-hidden="true" /> Filters
          {activeCount ? <span className="badge-sr-filters">{activeCount}</span> : null}
        </h6>
        {activeCount ? (
          <button type="button" className="btn btn-link link-dark text-decoration-none p-0 small d-flex align-items-center gap-1" onClick={onReset}>
            <RotateCcw size={13} aria-hidden="true" /> Reset
          </button>
        ) : null}
      </div>

      <div className="filter-group">
        <label className="sr-form-label" htmlFor="f-search">Search</label>
        <input
          id="f-search"
          type="search"
          className="sr-input"
          placeholder="Lehenga, gown, silk…"
          value={query}
          onChange={(e) => set({ query: e.target.value })}
        />
      </div>

      {trending ? (
        <div className="filter-group">
          <label className="sr-form-label d-block">Collection</label>
          <span className="filter-chip active">
            <Check size={13} aria-hidden="true" /> Trending
          </span>
        </div>
      ) : null}

      <div className="filter-group">
        <span className="sr-form-label d-block">Category</span>
        <div className="filter-options">
          {allCategories.map((c) => (
            <button
              key={c.category_id}
              type="button"
              className={`filter-chip ${categoryId === c.category_id ? 'active' : ''}`}
              onClick={() => set({ categoryId: categoryId === c.category_id ? null : c.category_id })}
            >
              {c.category_name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="sr-form-label d-block">Gender</span>
        <div className="filter-options">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              className={`filter-chip ${gender === g ? 'active' : ''}`}
              onClick={() => set({ gender: gender === g ? null : g })}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="sr-form-label d-block">Budget / Day</span>
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="sr-input"
            min="0"
            placeholder="Min"
            value={minPrice || ''}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : null })}
            aria-label="Min price"
          />
          <span>–</span>
          <input
            type="number"
            className="sr-input"
            min="0"
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            aria-label="Max price"
          />
        </div>
        <div className="budget-presets mt-2">
          {[1500, 3000, 5000].map((n) => (
            <button
              key={n}
              type="button"
              className={`filter-chip ${maxPrice === n ? 'active' : ''}`}
              onClick={() => set({ maxPrice: maxPrice === n ? null : n })}
            >
              Under {formatINR(n)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group mb-0">
        <label className="sr-form-label d-block">Sort By</label>
        <select
          className="sr-input"
          value={sort}
          onChange={(e) => set({ sort: e.target.value })}
          aria-label="Sort products"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div className="filter-result-note">
        {resultCount} {resultCount === 1 ? 'look' : 'looks'} available
      </div>
    </aside>
  )
}