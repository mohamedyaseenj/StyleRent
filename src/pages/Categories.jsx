import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SmartImage from '../components/common/SmartImage'
import Breadcrumbs from '../components/common/SearchBar'
import { SkeletonCards } from '../components/common/States'
import { categoryAPI, clothingAPI } from '../services/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([categoryAPI.getAll(), clothingAPI.getAll()])
      .then(([cats, items]) => {
        if (!active) return
        setCategories(cats)
        const map = {}
        cats.forEach((c) => {
          map[c.category_id] = items.filter((i) => i.category_id === c.category_id).length
        })
        setCounts(map)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="container section-space">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
      <div className="text-center mx-auto mt-3 mb-5" style={{ maxWidth: 640 }}>
        <span className="kicker">Browse</span>
        <h1 className="page-title">Shop by Category</h1>
        <p className="text-muted-sr">
          Every occasion deserves its own silhouette. Explore our ten curated edits of
          couture and occasion wear — all available to rent by the day.
        </p>
      </div>

      {loading ? (
        <SkeletonCards count={8} />
      ) : (
        <div className="row g-3 g-lg-4">
          {categories.map((cat, i) => (
            <div className="col-6 col-md-4 col-lg-3" key={cat.category_id}>
              <Link to={`/categories/${cat.category_id}`} className="text-decoration-none cat-tile">
                <div className="cat-tile-media">
                  <SmartImage src={cat.image_url} alt={cat.category_name} className="w-100 h-100" />
                  <span className="cat-tile-num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="cat-tile-body">
                  <h3>{cat.category_name}</h3>
                  <p>{cat.description}</p>
                  <span className="link-underline d-inline-flex align-items-center gap-1">
                    {counts[cat.category_id] || 0} looks · Explore <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}