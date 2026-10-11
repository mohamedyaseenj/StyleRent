import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarRange,
  Heart,
  Shirt,
  ShoppingBag,
  Sparkles,
  UserRound,
} from 'lucide-react'
import Breadcrumbs from '../../components/common/SearchBar'
import SectionHeading from '../../components/common/SectionHeading'
import ProductGrid from '../../components/clothing/ProductGrid'
import StatCard from '../../components/dashboard/StatCard'
import { LoadingSpinner } from '../../components/common/States'
import SmartImage from '../../components/common/SmartImage'
import { clothingAPI, rentalAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { withCategoryNames } from '../../utils/productUtils'
import { IMAGES } from '../../data/images'

// USER module dashboard — reuses the existing premium design system only.
// No new colors, typography, or layout primitives introduced.
const GENDER_CARDS = [
  {
    gender: 'Men',
    title: 'Men',
    description: 'Sherwanis, suits & tuxedos — groom-ready tailoring.',
    image: IMAGES.gallery.catSherwani,
    to: '/clothing?gender=Men',
  },
  {
    gender: 'Women',
    title: 'Women',
    description: 'Lehengas, gowns, sarees & festive icons.',
    image: IMAGES.gallery.catLehenga,
    to: '/clothing?gender=Women',
  },
  {
    gender: 'Kids',
    title: 'Kids',
    description: 'Party-ready festive looks for little stars.',
    image: IMAGES.gallery.catParty,
    to: '/clothing?gender=Kids',
  },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const { count: wishCount } = useWishlist()
  const [items, setItems] = useState([])
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([clothingAPI.getAll(), rentalAPI.getMyRentals(user?.user_id)])
      .then(([list, myRentals]) => {
        if (!active) return
        setItems(withCategoryNames(list))
        setRentals(myRentals || [])
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user?.user_id])

  const counts = useMemo(() => {
    const map = { Men: 0, Women: 0, Kids: 0 }
    items.forEach((p) => {
      if (p.gender in map) map[p.gender] += 1
    })
    return map
  }, [items])

  const trending = useMemo(() => items.filter((p) => p.trending).slice(0, 4), [items])
  const recent = useMemo(() => rentals.slice(0, 3), [rentals])

  return (
    <div className="container section-space">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Dashboard' }]} />

      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mt-3 mb-4">
        <div>
          <span className="kicker">User dashboard</span>
          <h1 className="page-title mb-0">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="text-muted-sr small mb-0 mt-1">
            Browse Men, Women &amp; Kids edits, check availability, and track every rental.
          </p>
        </div>
        <Link to="/clothing" className="btn btn-sr-gold btn-sr-sm d-inline-flex align-items-center gap-2">
          <ShoppingBag size={15} aria-hidden="true" /> Browse Clothing
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-4">
              <StatCard label="My Rentals" value={rentals.length} sub="Across all statuses" icon={Shirt} />
            </div>
            <div className="col-6 col-lg-4">
              <StatCard label="Wishlist" value={wishCount} sub="Looks you saved" icon={Heart} />
            </div>
            <div className="col-12 col-lg-4">
              <StatCard
                label="Looks Available"
                value={items.length}
                sub={`${counts.Men} Men · ${counts.Women} Women · ${counts.Kids} Kids`}
                icon={Sparkles}
              />
            </div>
          </div>

          <SectionHeading
            kicker="Three edits"
            title="Shop by Category"
            subtitle="Men, Women and Kids — each with live search, filters, availability and Rent Now checkout."
          />
          <div className="row g-3 g-lg-4 mb-5">
            {GENDER_CARDS.map((c) => (
              <div className="col-12 col-md-4" key={c.gender}>
                <Link to={c.to} className="text-decoration-none cat-tile">
                  <div className="cat-tile-media">
                    <SmartImage src={c.image} alt={`${c.title} rental collection`} className="w-100 h-100" />
                    <span className="cat-tile-num">{counts[c.gender] || 0} looks</span>
                  </div>
                  <div className="cat-tile-body">
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
                    <span className="link-underline d-inline-flex align-items-center gap-1">
                      Explore {c.title} <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="row g-3 mb-5">
            <div className="col-6 col-lg-3">
              <Link to="/clothing" className="btn btn-sr-outline btn-sr-block btn-sr-sm d-flex align-items-center justify-content-center gap-2">
                <ShoppingBag size={15} aria-hidden="true" /> Clothing Listing
              </Link>
            </div>
            <div className="col-6 col-lg-3">
              <Link to="/my-rentals" className="btn btn-sr-outline btn-sr-block btn-sr-sm d-flex align-items-center justify-content-center gap-2">
                <CalendarRange size={15} aria-hidden="true" /> My Rentals
              </Link>
            </div>
            <div className="col-6 col-lg-3">
              <Link to="/wishlist" className="btn btn-sr-outline btn-sr-block btn-sr-sm d-flex align-items-center justify-content-center gap-2">
                <Heart size={15} aria-hidden="true" /> Wishlist
              </Link>
            </div>
            <div className="col-6 col-lg-3">
              <Link to="/profile" className="btn btn-sr-outline btn-sr-block btn-sr-sm d-flex align-items-center justify-content-center gap-2">
                <UserRound size={15} aria-hidden="true" /> Profile
              </Link>
            </div>
          </div>

          {trending.length ? (
            <section className="mb-5">
              <SectionHeading kicker="Most loved" title="Trending For You" linkTo="/clothing?trending=1" linkLabel="View all trending" />
              <ProductGrid products={trending} />
            </section>
          ) : null}

          <section>
            <SectionHeading kicker="Recent activity" title="Your Latest Rentals" linkTo="/my-rentals" linkLabel="View all rentals" />
            {recent.length === 0 ? (
              <div className="card-sr p-4 text-center">
                <p className="fw-semibold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>No rentals yet</p>
                <p className="text-muted-sr small mb-3">Pick dates on any clothing detail page, check availability, then hit Rent Now.</p>
                <Link to="/clothing" className="btn btn-sr-gold btn-sr-sm">Start Browsing</Link>
              </div>
            ) : (
              <div className="row g-3">
                {recent.map((r) => (
                  <div className="col-12 col-md-4" key={r.rental_id}>
                    <div className="card-sr p-3 h-100">
                      <span className="kicker">#{r.rental_id} · {r.status}</span>
                      <p className="fw-semibold mb-1">₹{Number(r.total_amount).toLocaleString('en-IN')}</p>
                      <p className="text-muted-sr small mb-3">{r.start_date} → {r.end_date}</p>
                      <Link to={`/rental/${r.rental_id}`} className="link-underline small d-inline-flex align-items-center gap-1">
                        View details <ArrowRight size={13} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
