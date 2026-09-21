import { useState } from 'react'
import { X } from 'lucide-react'
import StarRating, { StarInput } from '../common/StarRating'
import FormInput from '../common/FormInput'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { validateReview } from '../../utils/validation'
import { formatDate, parseISO } from '../../utils/dateUtils'

// Single review row.
export function ReviewItem({ review, showReviewer = true }) {
  return (
    <div className="review-item">
      <div className="d-flex align-items-center gap-3 mb-2">
        {showReviewer ? (
          <span className="avatar-sr" aria-hidden="true">
            {String(review.reviewer_name || 'S').charAt(0).toUpperCase()}
          </span>
        ) : null}
        <div className="flex-grow-1">
          <strong className="d-block" style={{ fontFamily: 'var(--font-serif)' }}>
            {showReviewer ? review.reviewer_name : 'You'}
          </strong>
          <span className="text-muted-sr small">
            {formatDate(parseISO(review.created_at))}
          </span>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="review-comment mb-0">{review.comment}</p>
    </div>
  )
}

// Average-rating summary block.
export function RatingSummary({ average, count }) {
  return (
    <div className="rating-summary text-center px-4 py-4">
      <strong className="display-5 fw-bold d-block" style={{ fontFamily: 'var(--font-serif)' }}>
        {average.toFixed(1)}
      </strong>
      <StarRating rating={average} size={16} />
      <p className="text-muted-sr small mt-2 mb-0">
        Based on {count} {count === 1 ? 'review' : 'reviews'}
      </p>
    </div>
  )
}

// "Write a review" modal + submit.
export function ReviewFormModal({
  open,
  onClose,
  productName,
  onSubmit,
  submitting = false,
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState({})

  const reset = () => {
    setRating(0)
    setComment('')
    setErrors({})
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validateReview({ rating, comment })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    try {
      await onSubmit({ rating, comment })
      handleClose()
    } catch {
      setErrors({ comment: 'Could not submit your review. Please try again.' })
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Review ${productName}`}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <span className="sr-form-label">Your Rating *</span>
          <StarInput value={rating} onChange={setRating} />
          {errors.rating ? (
            <div className="sr-error-text" role="alert">{errors.rating}</div>
          ) : null}
        </div>
        <FormInput
          id="review-comment"
          as="textarea"
          rows={4}
          label="Your Review"
          required
          placeholder="How was the fit? The fabric? Would you wear it again?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={errors.comment}
        />
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="ghost" onClick={handleClose}>
            <X size={15} aria-hidden="true" /> Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  )
}