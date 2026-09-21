import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import Breadcrumbs from '../components/common/SearchBar'
import SmartImage from '../components/common/SmartImage'
import StarRating from '../components/common/StarRating'
import Button from '../components/common/Button'
import { EmptyState } from '../components/common/States'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { clothingAPI } from '../services/api'
import { withCategoryName } from '../utils/productUtils'
import { formatINR } from '../utils/priceUtils'

export default function Wishlist() {
  const { items, remove } = useWishlist()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    clothingAPI
      .getAll()
      .then((all) => {
        if (!active) return
        setProducts(all.map((p) => withCategoryName(p)))
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const wished = products.filter((p) => items.includes(p.clothing_id))

  const removeItem = (id) => {
    remove(id)
    toast.info('Removed from wishlist')
  }

  const moveAllToBag = () => {
    toast.info('Open each item to pick your size and dates.')
  }

  return (
    <div className="container section-space">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mt-3 mb-4">
        <div>
          <span className="kicker">Saved for later</span>
          <h1 className="page-title mb-0">My Wishlist</h1>
          <p className="text-muted-sr small mb-0 mt-1">
            {wished.length} {wished.length === 1 ? 'look' : 'looks'} saved
          </p>
        </div>
        {wished.length ? (
          <Button variant="outline" size="sm" icon={ShoppingBag} onClick={moveAllToBag}>
            How to book saved items
          </Button>
        ) : null}
      </div>

      {loading ? null : wished.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="Tap the heart on any piece to save it here for later."
          icon={<Heart size={30} aria-hidden="true" />}
          action={<Link to="/clothing" className="btn btn-sr-gold">Discover Looks</Link>}
        />
      ) : (
        <div className="row g-3 g-lg-4">
          {wished.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.clothing_id}>
              <div className="product-card h-100">
                <Link to={`/clothing/${p.clothing_id}`} className="d-block">
                  <div className="product-media">
                    <SmartImage src={p.image_url} alt={p.name} className="w-100 h-100" />
                    <button
                      type="button"
                      className="wishlist-btn wished"
                      onClick={(e) => {
                        e.preventDefault()
                        removeItem(p.clothing_id)
                      }}
                      aria-label={`Remove ${p.name} from wishlist`}
                    >
                      <Heart size={18} fill="currentColor" aria-hidden="true" />
                    </button>
                  </div>
                </Link>
                <div className="product-body">
                  <span className="product-category">{p.categoryName}</span>
                  <Link to={`/clothing/${p.clothing_id}`} className="text-decoration-none">
                    <h4 className="product-name">{p.name}</h4>
                  </Link>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <StarRating rating={p.rating} showValue />
                  </div>
                  <div className="product-meta">
                    <div className="product-price">
                      <span className="price-sr">{formatINR(p.price_per_day)}</span>
                      <span className="price-per-day">/day</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <Link to={`/clothing/${p.clothing_id}`} className="btn btn-sr-primary btn-sr-sm flex-grow-1">
                      Rent Now
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sr-outline btn-sr-sm"
                      onClick={() => removeItem(p.clothing_id)}
                      aria-label="Remove"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}