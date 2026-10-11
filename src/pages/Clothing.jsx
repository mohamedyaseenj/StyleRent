import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductFilters from '../components/clothing/ProductFilters'
import ProductGrid from '../components/clothing/ProductGrid'
import { SkeletonCards } from '../components/common/States'
import { Breadcrumbs } from '../components/common/SearchBar'
import { clothingAPI } from '../services/api'
import { withCategoryNames, applyFilters } from '../utils/productUtils'

const DEFAULT_STATE = {
  query: '',
  categoryId: null,
  gender: null,
  minPrice: null,
  maxPrice: null,
  sort: 'popular',
  trending: false,
}

export default function Clothing() {
  const [params] = useSearchParams()
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initial filter state from URL (?q=, ?gender= and ?trending=1).
  const initial = useMemo(() => ({
    ...DEFAULT_STATE,
    query: params.get('q') || '',
    gender: params.get('gender') || null,
    trending: params.get('trending') === '1',
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const [state, setState] = useState(initial)
  const [mobileFilters, setMobileFilters] = useState(false)

  // Keep Men / Women / Kids landing links (?gender=) in sync with filter state.
  useEffect(() => {
    const g = params.get('gender')
    const q = params.get('q') || ''
    const trending = params.get('trending') === '1'
    setState((s) => {
      if (s.gender === g && s.query === q && s.trending === trending) return s
      return { ...s, gender: g, query: q, trending }
    })
  }, [params])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    clothingAPI
      .getAll({ trending: state.trending ? '1' : undefined })
      .then((list) => {
        if (!active) return
        setAll(withCategoryNames(list))
      })
      .catch(() => active && setError('Could not load the collection.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [state.trending])

  const updateState = (patch) => {
    setState((s) => ({ ...s, ...patch }))
  }

  const reset = () => setState({ ...DEFAULT_STATE, trending: state.trending })

  const filtered = useMemo(
    () => applyFilters(all, state),
    [all, state],
  )

  return (
    <div className="container section-space">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop All' }]} />
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mt-3 mb-4">
        <div>
          <span className="kicker">{state.trending ? 'Trending' : 'The Collection'}</span>
          <h1 className="page-title mb-0">
            {state.trending ? 'Trending This Season' : 'All Clothing'}
          </h1>
          <p className="text-muted-sr small mb-0 mt-1">
            {loading ? 'Loading pieces…' : `${filtered.length} ${filtered.length === 1 ? 'look' : 'looks'} to rent.`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sr-outline btn-sr-sm d-lg-none d-flex align-items-center gap-2"
          onClick={() => setMobileFilters((v) => !v)}
        >
          {mobileFilters ? <X size={15} aria-hidden="true" /> : <SlidersHorizontal size={15} aria-hidden="true" />}
          {mobileFilters ? 'Close Filters' : 'Filters'}
        </button>
      </div>

      <div className="row g-4">
        <div className={`col-lg-3 ${mobileFilters ? 'd-block' : 'd-none d-lg-block'}`}>
          <ProductFilters
            state={state}
            onChange={updateState}
            onReset={reset}
            resultCount={filtered.length}
          />
        </div>
        <div className="col-lg-9">
          {loading ? (
            <SkeletonCards count={8} />
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>
    </div>
  )
}