import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, Sparkles } from 'lucide-react'
import SmartImage from '../common/SmartImage'
import StarRating from '../common/StarRating'
import Button from '../common/Button'
import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { formatINR } from '../../utils/priceUtils'

export default function ProductCard({ product }) {
  const { toggle, has } = useWishlist()
  const toast = useToast()
  const navigate = useNavigate()
  const [quickOpen, setQuickOpen] = useState(false)

  const wished = has(product.clothing_id)

  const onWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.clothing_id)
    toast[wished ? 'info' : 'success'](
      wished ? 'Removed from wishlist' : 'Added to wishlist',
    )
  }

  return (
    <div className="product-card h-100">
      <Link to={`/clothing/${product.clothing_id}`} className="d-block product-media-link">
        <div className="product-media">
          <SmartImage src={product.image_url} alt={`${product.name} — ${product.color}`} className="w-100 h-100" />
          {product.tags?.length ? (
            <div className="product-tags">
              {product.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={`tag-sr ${tag === 'NEW' ? 'tag-new' : tag === 'LIMITED' ? 'tag-red' : 'tag-gold'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className={`wishlist-btn ${wished ? 'wished' : ''}`}
            onClick={onWishlist}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={wished}
          >
            <Heart size={18} fill={wished ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="product-quick"
            onClick={(e) => {
              e.preventDefault()
              setQuickOpen(true)
            }}
          >
            <Eye size={14} aria-hidden="true" /> Quick View
          </button>
        </div>
      </Link>

      <div className="product-body">
        <span className="product-category">{product.categoryName || 'StyleRent Edit'}</span>
        <Link to={`/clothing/${product.clothing_id}`} className="text-decoration-none">
          <h4 className="product-name">{product.name}</h4>
        </Link>
        <div className="d-flex align-items-center gap-2 mb-2">
          <StarRating rating={product.rating} showValue />
          <span className="text-muted-sr" style={{ fontSize: 13 }}>({product.reviewCount})</span>
        </div>
        <div className="product-meta">
          <div className="product-price">
            <span className="price-sr">{formatINR(product.price_per_day)}</span>
            <span className="price-per-day">/day</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="color-dots" aria-label={`Colour: ${product.color}`}>
              <span className="color-dot" style={{ background: product.colorHex }} title={product.color} />
            </span>
          </div>
        </div>
        <div className="mt-3 d-flex align-items-center justify-content-between">
          <StatusBadge status={product.stock} type="stock" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/clothing/${product.clothing_id}`)}
          >
            Rent Now
          </Button>
        </div>
      </div>

      <Modal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        title={product.name}
      >
        <div className="d-flex gap-3 flex-column flex-sm-row">
          <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: 150, aspectRatio: '3/4' }}>
            <SmartImage src={product.image_url} alt={product.name} className="w-100 h-100" />
          </div>
          <div>
            <span className="product-category">{product.categoryName || 'StyleRent Edit'}</span>
            <div className="d-flex align-items-center gap-2 mt-1 mb-2">
              <StarRating rating={product.rating} showValue />
              <span className="text-muted-sr small">({product.reviewCount} reviews)</span>
            </div>
            <p className="text-muted-sr small mb-2">{product.description}</p>
            <p className="mb-2">
              <span className="price-sr">{formatINR(product.price_per_day)}</span>{' '}
              <span className="text-muted-sr small">/day</span>
              <span className="text-muted-sr d-inline-block ms-3 small">
                Colour <b className="text-dark">{product.color}</b>
              </span>
            </p>
            <p className="mb-3 d-flex align-items-center gap-2">
              <Sparkles size={15} className="text-gold" aria-hidden="true" />
              <StatusBadge status={product.stock} type="stock" />
            </p>
            <Button onClick={() => { setQuickOpen(false); navigate(`/clothing/${product.clothing_id}`) }}>
              View Details &amp; Rent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}