import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Sparkles,
  CalendarRange,
  MessageSquarePlus,
} from 'lucide-react'
import Breadcrumbs from '../components/common/SearchBar'
import StarRating from '../components/common/StarRating'
import Button from '../components/common/Button'
import StatusBadge from '../components/common/StatusBadge'
import SectionHeading from '../components/common/SectionHeading'
import ProductGallery from '../components/clothing/ProductGallery'
import SizeSelector, { ColorSelector } from '../components/clothing/Selectors'
import AvailabilityChecker from '../components/clothing/AvailabilityChecker'
import ProductGrid from '../components/clothing/ProductGrid'
import { ReviewItem, RatingSummary, ReviewFormModal } from '../components/review/Review'
import { LoadingSpinner, ErrorMessage } from '../components/common/States'
import { clothingAPI, reviewAPI } from '../services/api'
import { useWishlist } from '../context/WishlistContext'
import { useRental } from '../context/RentalContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { withCategoryNames } from '../utils/productUtils'
import { formatINR, calcRentalTotal } from '../utils/priceUtils'
import { todayISO, addDaysISO, daysBetween, parseISO } from '../utils/dateUtils'

export default function ClothingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { has, toggle } = useWishlist()
  const { setRental } = useRental()
  const { isAuthenticated } = useAuth()
  const toast = useToast()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [size, setSize] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 4))
  const [qty, setQty] = useState(1)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([
      clothingAPI.getById(id),
      clothingAPI.getRelated(id),
      reviewAPI.getByClothing(id),
    ])
      .then(([p, rel, revs]) => {
        if (!active) return
        setProduct(withCategoryNames([p])[0])
        setRelated(withCategoryNames(rel))
        setReviews(revs)
      })
      .catch(() => active && setError('This piece could not be found.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <div className="container section-space"><LoadingSpinner /></div>
  if (error || !product) {
    return (
      <div className="container section-space py-5">
        <ErrorMessage message={error || 'Item unavailable.'} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const wished = has(product.clothing_id)
  const days = daysBetween(parseISO(startDate), parseISO(endDate))
  const validWindow = days >= 1 && startDate && endDate
  const total = validWindow ? calcRentalTotal(product.price_per_day, days, qty) : 0

  const fillDraft = (toBooking) => {
    if (!size) {
      toast.info('Please select a size first.')
      return
    }
    if (!validWindow) {
      toast.info('Please choose a valid date window.')
      return
    }
    setRental({ clothing_id: product.clothing_id, size, startDate, endDate, quantity: qty })
    if (toBooking) navigate('/booking')
  }

  const submitReview = async ({ rating, comment }) => {
    setReviewSubmitting(true)
    try {
      await reviewAPI.create({
        user_id: null,
        clothing_id: product.clothing_id,
        rating,
        comment,
        reviewer_name: 'You',
      })
      const fresh = await reviewAPI.getByClothing(product.clothing_id)
      setReviews(fresh)
      toast.success('Thanks for your review!')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const average = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : product.rating

  return (
    <>
      <div className="container section-space pt-4">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Shop All', to: '/clothing' },
            { label: product.categoryName || 'StyleRent Edit' },
          ]}
        />

        <div className="row g-4 g-lg-5 mt-2">
          {/* Gallery */}
          <div className="col-lg-6">
            <ProductGallery images={product.gallery || [product.image_url]} alt={product.name} />
          </div>

          {/* Info */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <StatusBadge status={product.stock} type="stock" />
              {product.tags?.map((t) => (
                <span key={t} className={`tag-sr ${t === 'NEW' ? 'tag-new' : t === 'LIMITED' ? 'tag-red' : 'tag-gold'}`}>
                  {t}
                </span>
              ))}
            </div>
            <h1 className="product-detail-name">{product.name}</h1>

            <div className="d-flex align-items-center gap-2 mb-3">
              <StarRating rating={product.rating} size={16} showValue />
              <span className="text-muted-sr small">
                {average.toFixed(1)} · {reviews.length} reviews
              </span>
            </div>

            <p className="price-line mb-4">
              <span className="price-sr">{formatINR(product.price_per_day)}</span>
              <span className="price-per-day">/day</span>
              <span className="text-muted-sr small ms-2">
                Save up to 90% vs buying
              </span>
            </p>

            <p className="product-description mb-4">{product.description}</p>

            <ColorSelector color={product.color} colorHex={product.colorHex} />

            <div className="mt-4">
              <SizeSelector
                sizes={product.availableSizes}
                value={size}
                onChange={setSize}
              />
            </div>

            <div className="row g-3 mt-3 align-items-end">
              <div className="col-6">
                <label className="sr-form-label" htmlFor="det-start">Start Date</label>
                <input
                  id="det-start"
                  type="date"
                  className="sr-input"
                  value={startDate}
                  min={todayISO()}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="sr-form-label" htmlFor="det-end">End Date</label>
                <input
                  id="det-end"
                  type="date"
                  className="sr-input"
                  value={endDate}
                  min={startDate || todayISO()}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mt-3">
              <div className="d-flex align-items-center border rounded" style={{ borderColor: 'var(--color-border)!important' }}>
                <button type="button" className="btn btn-sr-sm border-0" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="px-3 fw-semibold">{qty}</span>
                <button type="button" className="btn btn-sr-sm border-0" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <span className="text-muted-sr small">
                × {formatINR(product.price_per_day)} /day
              </span>
              {validWindow ? (
                <span className="ms-auto fw-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
                  {formatINR(total)}
                </span>
              ) : null}
            </div>

            <AvailabilityChecker product={product} startDate={startDate} endDate={endDate} />

            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button variant="gold" size="lg" icon={ShoppingBag} onClick={() => fillDraft(true)}>
                Rent This Look
              </Button>
              <Button
                variant={wished ? 'light' : 'outline'}
                size="lg"
                icon={Heart}
                onClick={() => {
                  toggle(product.clothing_id)
                  toast[wished ? 'info' : 'success'](wished ? 'Removed from wishlist' : 'Saved to wishlist')
                }}
              >
                {wished ? 'Saved' : 'Save'}
              </Button>
              {isAuthenticated ? (
                <Button variant="ghost" size="lg" icon={MessageSquarePlus} onClick={() => setReviewOpen(true)}>
                  Review
                </Button>
              ) : null}
            </div>
            <p className="text-muted-sr small mt-2">
              {product.stock > 5
                ? `${product.stock} pieces in stock — book early.`
                : product.stock > 0
                  ? `Only ${product.stock} left — almost gone!`
                  : 'Currently out of stock.'}
            </p>

            <div className="perk-row mt-4">
              <span className="perk"><Truck size={17} aria-hidden="true" /> Free delivery over ₹1,000</span>
              <span className="perk"><Sparkles size={17} aria-hidden="true" /> Freshly dry-cleaned</span>
              <span className="perk"><CalendarRange size={17} aria-hidden="true" /> Reschedule once free</span>
              <span className="perk"><RotateCcw size={17} aria-hidden="true" /> Prepaid return label</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-5">
          <div className="row g-4">
            <div className="col-lg-4">
              <RatingSummary average={average} count={reviews.length || product.reviewCount} />
            </div>
            <div className="col-lg-8">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0" style={{ fontFamily: 'var(--font-serif)' }}>Reviews</h3>
                {isAuthenticated ? (
                  <Button variant="outline" size="sm" icon={MessageSquarePlus} onClick={() => setReviewOpen(true)}>
                    Write a Review
                  </Button>
                ) : null}
              </div>
              {reviews.length ? (
                reviews.slice(0, 6).map((r) => <ReviewItem key={r.review_id} review={r} />)
              ) : (
                <p className="text-muted-sr">No reviews yet — be the first.</p>
              )}
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length ? (
          <section className="mt-5 pt-3">
            <SectionHeading kicker="Keep exploring" title="You May Also Love" linkTo="/clothing" linkLabel="Shop all" />
            <ProductGrid products={related.slice(0, 4)} />
          </section>
        ) : null}

        <ReviewFormModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          productName={product.name}
          onSubmit={submitReview}
          submitting={reviewSubmitting}
        />
      </div>
    </>
  )
}