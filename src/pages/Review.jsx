import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Star, MessageSquarePlus } from 'lucide-react'
import Breadcrumbs from '../components/common/SearchBar'
import SmartImage from '../components/common/SmartImage'
import Button from '../components/common/Button'
import FormInput from '../components/common/FormInput'
import StarRating, { StarInput } from '../components/common/StarRating'
import { LoadingSpinner, ErrorMessage } from '../components/common/States'
import { ReviewItem } from '../components/review/Review'
import { clothingAPI, reviewAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { withCategoryName } from '../utils/productUtils'
import { validateReview } from '../utils/validation'
import { formatINR } from '../utils/priceUtils'

export default function Review() {
  const { clothingId } = useParams()
  const { user } = useAuth()
  const toast = useToast()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([clothingAPI.getById(clothingId), reviewAPI.getByClothing(clothingId)])
      .then(([p, revs]) => {
        if (!active) return
        setProduct(withCategoryName(p))
        setReviews(revs)
      })
      .catch(() => active && setError('This item could not be found.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [clothingId])

  const submit = async (e) => {
    e.preventDefault()
    const validation = validateReview({ rating, comment })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await reviewAPI.create({
        user_id: user?.user_id,
        clothing_id: Number(clothingId),
        rating,
        comment,
        reviewer_name: user?.name || 'StyleRent Member',
      })
      const fresh = await reviewAPI.getByClothing(clothingId)
      setReviews(fresh)
      setRating(0)
      setComment('')
      toast.success('Review published. Thank you!')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container section-space"><LoadingSpinner /></div>
  if (error || !product) {
    return (
      <div className="container section-space py-5">
        <ErrorMessage message={error || 'Item unavailable.'} />
      </div>
    )
  }

  const average = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : product.rating

  return (
    <div className="container section-space">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My Rentals', to: '/my-rentals' },
          { label: `Review ${product.name}` },
        ]}
      />

      <div className="row g-4 mt-2">
        <div className="col-lg-4">
          <div className="card-sr p-3 sticky-lg-top" style={{ top: 100 }}>
            <div className="rounded overflow-hidden mb-3" style={{ aspectRatio: '3/4' }}>
              <SmartImage src={product.image_url} alt={product.name} className="w-100 h-100" />
            </div>
            <span className="product-category">{product.categoryName}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}>{product.name}</h2>
            <div className="d-flex align-items-center gap-2 mb-2">
              <StarRating rating={average} size={16} showValue />
              <span className="text-muted-sr small">({reviews.length} reviews)</span>
            </div>
            <span className="price-sr">{formatINR(product.price_per_day)}</span>
            <span className="price-per-day">/day</span>
            <Link to={`/clothing/${product.clothing_id}`} className="btn btn-sr-outline btn-sr-block btn-sr-sm mt-3 d-flex align-items-center justify-content-center gap-2">
              <ArrowLeft size={14} aria-hidden="true" /> View Item
            </Link>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card-sr p-3 p-md-4 mb-4">
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <MessageSquarePlus size={18} aria-hidden="true" /> Write a Review
            </h5>
            <form onSubmit={submit} noValidate>
              <div className="mb-3">
                <span className="sr-form-label">Your Rating *</span>
                <StarInput value={rating} onChange={setRating} />
                {errors.rating ? <div className="sr-error-text" role="alert">{errors.rating}</div> : null}
              </div>
              <FormInput
                id="page-review-comment"
                as="textarea"
                rows={4}
                label="Your Review"
                required
                placeholder="How was the fit, fabric and overall experience?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                error={errors.comment}
              />
              <Button type="submit" icon={Star} loading={submitting}>Publish Review</Button>
            </form>
          </div>

          <h5 className="mb-3">What others said</h5>
          {reviews.length ? (
            reviews.map((r) => <ReviewItem key={r.review_id} review={r} />)
          ) : (
            <p className="text-muted-sr">No reviews yet — be the first to share your experience.</p>
          )}
        </div>
      </div>
    </div>
  )
}