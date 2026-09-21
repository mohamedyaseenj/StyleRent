import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRound, Save, Package, Heart, IndianRupee, CalendarClock } from 'lucide-react'
import Breadcrumbs from '../components/common/SearchBar'
import FormInput from '../components/common/FormInput'
import Button from '../components/common/Button'
import StatCard from '../components/dashboard/StatCard'
import { LoadingSpinner } from '../components/common/States'
import StatusBadge from '../components/common/StatusBadge'
import { rentalAPI } from '../services/api'
import { getProductById } from '../data/products'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { isPhone, required } from '../utils/validation'
import { formatINR } from '../utils/priceUtils'
import { formatDate, parseISO } from '../utils/dateUtils'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { count: wishCount } = useWishlist()
  const toast = useToast()

  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' })
  }, [user])

  useEffect(() => {
    let active = true
    rentalAPI
      .getMyRentals(user?.user_id)
      .then((list) => active && setRentals(list))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user?.user_id])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = (e) => {
    e.preventDefault()
    const errs = {}
    if (!required(form.name) || form.name.trim().length < 3) errs.name = 'Please enter your full name.'
    if (required(form.phone) && !isPhone(form.phone)) errs.phone = 'Please enter a valid phone number.'
    if (!required(form.address)) errs.address = 'Please enter your city.'
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSaving(true)
    setTimeout(() => {
      updateProfile(form)
      setSaving(false)
      toast.success('Profile updated.')
    }, 400)
  }

  const active = rentals.filter((r) => r.status === 'Active' || r.status === 'Confirmed').length
  const spent = rentals
    .filter((r) => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0)

  return (
    <div className="container section-space">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Profile' }]} />
      <div className="d-flex align-items-center gap-3 mt-3 mb-4">
        <span className="avatar-sr avatar-lg" aria-hidden="true">
          {String(user?.name || 'U').charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="page-title mb-0">{user?.name}</h1>
          <p className="text-muted-sr small mb-0">{user?.email} · Member since {formatDate(parseISO(user?.created_at))}</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Total Rentals" value={rentals.length} icon={Package} sub="all time" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Active Now" value={active} icon={CalendarClock} sub="in your closet" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Wishlisted" value={wishCount} icon={Heart} sub="saved looks" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Total Spent" value={formatINR(spent)} icon={IndianRupee} sub="excl. cancellations" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <form className="card-sr p-3 p-md-4" onSubmit={save} noValidate>
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <UserRound size={18} aria-hidden="true" /> Personal Details
            </h5>
            <FormInput id="pf-name" label="Full Name" value={form.name} onChange={set('name')} error={errors.name} />
            <FormInput id="pf-email" label="Email" value={user?.email || ''} disabled hint="Email cannot be changed in demo mode." />
            <FormInput id="pf-phone" label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone} />
            <FormInput id="pf-address" label="City" value={form.address} onChange={set('address')} error={errors.address} />
            <Button type="submit" icon={Save} loading={saving}>Save Changes</Button>
          </form>
        </div>

        <div className="col-lg-6">
          <div className="card-sr p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Recent Rentals</h5>
              <Link to="/my-rentals" className="link-gold small">View all</Link>
            </div>
            {loading ? (
              <LoadingSpinner compact />
            ) : rentals.length === 0 ? (
              <p className="text-muted-sr small mb-0">No rentals yet.</p>
            ) : (
              rentals.slice(0, 4).map((r) => {
                const p = getProductById(r.items?.[0]?.clothing_id)
                return (
                  <Link
                    to={`/rental/${r.rental_id}`}
                    key={r.rental_id}
                    className="d-flex align-items-center gap-3 py-2 border-bottom text-decoration-none text-dark"
                  >
                    <img src={p?.image_url} alt="" className="rounded" style={{ width: 52, height: 66, objectFit: 'cover' }} />
                    <div className="flex-grow-1">
                      <strong className="d-block small" style={{ fontFamily: 'var(--font-serif)' }}>{p?.name || 'Rental'}</strong>
                      <span className="text-muted-sr" style={{ fontSize: 12 }}>
                        {formatDate(parseISO(r.start_date))}
                      </span>
                    </div>
                    <StatusBadge status={r.status} type="rental" />
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}