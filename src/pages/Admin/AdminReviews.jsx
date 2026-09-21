import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Trash2, EyeOff, Star } from 'lucide-react'
import StarRating from '../../components/common/StarRating'
import Button from '../../components/common/Button'
import { SearchInput } from '../../components/common/SearchBar'
import { EmptyState } from '../../components/common/States'
import { reviews as seedReviews } from '../../data/reviews'
import { products } from '../../data/products'
import { users } from '../../data/users'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { formatDate, parseISO } from '../../utils/dateUtils'

export default function AdminReviews() {
  const toast = useToast()
  const { user: currentUser } = useAuth()
  const [reviews, setReviews] = useState(seedReviews)
  const [query, setQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [statusMap, setStatusMap] = useState({})
  const [replyFor, setReplyFor] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyMap, setReplyMap] = useState({})

  const productName = (id) => products.find((p) => p.clothing_id === id)?.name || 'Unknown item'
  const userName = (id) => users.find((u) => u.user_id === id)?.name

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return reviews.filter((r) => {
      const matchQ =
        r.comment.toLowerCase().includes(q) ||
        (r.reviewer_name || '').toLowerCase().includes(q) ||
        productName(r.clothing_id).toLowerCase().includes(q)
      return matchQ && (ratingFilter === 0 || r.rating === ratingFilter)
    })
  }, [reviews, query, ratingFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = (id, status) => setStatusMap((m) => ({ ...m, [id]: status }))

  const remove = (id) => {
    setReviews((prev) => prev.filter((r) => r.review_id !== id))
    toast.info('Review deleted.')
  }

  return (
    <div className="card-sr p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">Review Moderation</h5>
          <span className="text-muted-sr small">{filtered.length} reviews</span>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search reviews…" />
      </div>

      <div className="tab-row mb-3">
        {[0, 5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            type="button"
            className={`tab-chip ${ratingFilter === r ? 'active' : ''}`}
            onClick={() => setRatingFilter(r)}
          >
            {r === 0 ? 'All ratings' : `${r}★`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No reviews found" message="Try a different search or rating filter." icon={<Star size={30} aria-hidden="true" />} />
      ) : (
        <div className="row g-3">
          {filtered.map((r) => {
            const status = statusMap[r.review_id] || 'Published'
            return (
              <div className="col-12" key={r.review_id}>
                <div className={`admin-review ${status === 'Hidden' ? 'hidden-review' : ''}`}>
                  <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="avatar-sr" aria-hidden="true">
                          {(r.reviewer_name || 'S').charAt(0)}
                        </span>
                        <div>
                          <strong className="d-block" style={{ fontFamily: 'var(--font-serif)' }}>
                            {r.reviewer_name || userName(r.user_id) || 'Member'}
                          </strong>
                          <span className="text-muted-sr" style={{ fontSize: 12 }}>
                            {formatDate(parseISO(r.created_at))}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <StarRating rating={r.rating} />
                      {status === 'Hidden' ? (
                        <span className="badge-soft text-warning">Hidden</span>
                      ) : (
                        <span className="badge-soft text-success">Published</span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 mb-2 small">{r.comment}</p>
                  <Link to={`/clothing/${r.clothing_id}`} className="small link-gold">
                    {productName(r.clothing_id)}
                  </Link>

                  {replyMap[r.review_id] ? (
                    <div className="admin-reply mt-3">
                      <strong className="d-block small">StyleRent Team</strong>
                      <p className="mb-0 small">{replyMap[r.review_id]}</p>
                    </div>
                  ) : null}

                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    {status === 'Published' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={EyeOff}
                        onClick={() => {
                          setStatus(r.review_id, 'Hidden')
                          toast.info('Review hidden from the storefront.')
                        }}
                      >
                        Hide
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Check}
                        onClick={() => {
                          setStatus(r.review_id, 'Published')
                          toast.success('Review republished.')
                        }}
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyFor(replyFor === r.review_id ? null : r.review_id)
                        setReplyText(replyMap[r.review_id] || '')
                      }}
                    >
                      Reply
                    </Button>
                    <button
                      type="button"
                      className="btn btn-sr-ghost btn-sr-sm text-danger d-inline-flex align-items-center gap-1"
                      onClick={() => remove(r.review_id)}
                    >
                      <Trash2 size={14} aria-hidden="true" /> Delete
                    </button>
                  </div>

                  {replyFor === r.review_id ? (
                    <div className="mt-3">
                      <textarea
                        className="sr-textarea"
                        rows={2}
                        placeholder={`Reply publicly as ${currentUser?.name || 'StyleRent Team'}…`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="d-flex justify-content-end mt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setReplyMap((m) => ({ ...m, [r.review_id]: replyText }))
                            setReplyFor(null)
                            toast.success('Reply posted.')
                          }}
                          disabled={!replyText.trim()}
                        >
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}