import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarHeart,
  Sparkles,
  Truck,
  RotateCcw,
  ShoppingBag,
  ShieldCheck,
  Star,
  Quote,
} from 'lucide-react'
import SmartImage from '../components/common/SmartImage'
import SectionHeading from '../components/common/SectionHeading'
import ProductGrid from '../components/clothing/ProductGrid'
import { lookbookCollections, howItWorks, styleEdits } from '../data/trends'
import { products } from '../data/products'
import { withCategoryNames } from '../utils/productUtils'
import { IMAGES } from '../data/images'
import { formatINR } from '../utils/priceUtils'

const FEATURES = [
  { icon: Sparkles, title: 'Couture Quality', description: 'Steamed, pressed and inspection-ready.' },
  { icon: ShieldCheck, title: 'Secured Booking', description: 'Live availability & secure payments.' },
  { icon: Truck, title: 'Doorstep Delivery', description: 'Free delivery above ₹1,000.' },
  { icon: RotateCcw, title: 'Zero-Fuss Returns', description: 'Prepaid label, return in 48 hours.' },
]

export default function Home() {
  const hero = products[0]
  const trending = withCategoryNames(products.filter((p) => p.trending).slice(0, 6))
  const featured = withCategoryNames(products.filter((p) => p.featured).slice(0, 4))

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container">
          <div className="row g-0 align-items-center min-vh-75">
            <div className="col-lg-5 hero-copy">
              <span className="kicker">India&rsquo;s premier rental atelier</span>
              <h1 className="hero-title">
                Rent the Look.
                <br />
                Own the <span className="text-gold">Moment.</span>
              </h1>
              <p className="hero-sub">
                Designer lehengas, gowns, sherwanis &amp; suits from ₹799/day.
                Handpicked, dry-cleaned and delivered to your door.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/clothing" className="btn btn-sr-gold btn-sr-lg">
                  <ShoppingBag size={18} aria-hidden="true" /> Shop the Collection
                </Link>
                <Link to="/#how-it-works" className="btn btn-sr-light btn-sr-lg">
                  How It Works <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <div className="hero-trust">
                <span>★ 4.8 rating</span>
                <span>15k+ rentals</span>
                <span>500+ ateliers</span>
              </div>
            </div>
            <div className="col-lg-7 hero-media-wrap">
              <div className="hero-media">
                <SmartImage src={hero.image_url} alt={hero.name} className="w-100 h-100" />
              </div>
              <div className="hero-inline-card">
                <div>
                  <span className="text-muted-sr small">Today&rsquo;s pick</span>
                  <strong className="d-block" style={{ fontFamily: 'var(--font-serif)' }}>
                    {hero.name}
                  </strong>
                </div>
                <span className="price-sr">{formatINR(hero.price_per_day)}<span className="price-per-day">/day</span></span>
                <Link to={`/clothing/${hero.clothing_id}`} className="nav-icon-btn">
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES STRIP ================= */}
      <section className="feature-strip">
        <div className="container">
          <div className="row g-3">
            {FEATURES.map((f) => (
              <div className="col-6 col-lg-3" key={f.title}>
                <div className="feature-strip-item">
                  <f.icon size={22} aria-hidden="true" />
                  <div>
                    <strong className="d-block">{f.title}</strong>
                    <span className="text-muted-sr small">{f.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRENDING ================= */}
      <section className="container section-space">
        <SectionHeading
          kicker="Most Loved"
          title="Trending Right Now"
          subtitle="The pieces our members can't stop renting this season."
          linkTo="/clothing?trending=1"
          linkLabel="View all trending"
        />
        <ProductGrid products={trending} />
      </section>

      {/* ================= STYLE EDITS ================= */}
      <section className="bg-beige section-space overflow-hidden">
        <div className="container">
          <SectionHeading
            kicker="Curated Flow"
            title="The Style Edits"
            subtitle="Six editorial moods, each one styled for a different kind of evening."
            linkTo="/clothing"
            linkLabel="Shop all"
          />
          <div className="style-edit-strip d-flex gap-3">
            {styleEdits.map((edit) => (
              <article className="style-edit-card" key={edit.id}>
                <div className="style-edit-media">
                  <SmartImage src={edit.image} alt={edit.name} className="w-100 h-100" />
                  <span className="edit-num">{edit.num}</span>
                  <span className="edit-tag">{edit.tag}</span>
                </div>
                <div className="style-edit-body">
                  <h3>{edit.name}</h3>
                  <p>{edit.description}</p>
                  <Link to="/clothing" className="link-underline d-inline-flex align-items-center gap-1">
                    Explore <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="container section-space">
        <SectionHeading
          kicker="The Icons"
          title="Featured Icons"
          subtitle="Editor-favourite silhouettes from the StyleRent collection."
          linkTo="/clothing"
        />
        <ProductGrid products={featured} />
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="bg-ivory section-space overflow-hidden">
        <div className="container">
          <SectionHeading
            kicker="Browse"
            title="Shop by Occasion"
            subtitle="From sangeet to sunrise — find exactly what tonight calls for."
            linkTo="/categories"
            linkLabel="All categories"
          />
          <div className="category-strip d-flex gap-3">
            {[
              { id: 2, name: 'Lehenga', img: IMAGES.gallery.catLehenga },
              { id: 3, name: 'Gowns', img: IMAGES.gallery.catGowns },
              { id: 5, name: 'Sherwani', img: IMAGES.gallery.catSherwani },
              { id: 1, name: 'Sarees', img: IMAGES.gallery.catSarees },
              { id: 7, name: 'Tuxedo', img: IMAGES.gallery.catTuxedo },
              { id: 8, name: 'Party Wear', img: IMAGES.gallery.catParty },
            ].map((c) => (
              <Link to={`/categories/${c.id}`} className="category-card" key={c.id}>
                <div className="category-media">
                  <SmartImage src={c.img} alt={c.name} className="w-100 h-100" />
                  <span className="category-label">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LOOKBOOK ================= */}
      <section className="container section-space">
        <SectionHeading
          kicker="The Collections"
          title="StyleRent Lookbook"
          subtitle="Four edits, one subscription-worthy wardrobe."
          linkTo="/categories"
          linkLabel="Explore"
        />
        <div className="row g-3">
          {lookbookCollections.map((c, i) => (
            <div className="col-6 col-lg-3" key={c.id}>
              <Link
                to={`/categories/${c.categoryId}`}
                className={`lookbook-card ${i % 2 === 0 ? 'offset-md' : ''}`}
                style={{ display: 'block' }}
              >
                <div className="lookbook-media">
                  <SmartImage src={c.image} alt={c.title} className="w-100 h-100" />
                </div>
                <div className="lookbook-body">
                  <h4>{c.title}</h4>
                  <p>{c.description}</p>
                  <span className="link-underline d-inline-flex align-items-center gap-1">
                    View Edit <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="bg-black text-white section-space position-relative overflow-hidden">
        <span className="section-watermark" aria-hidden="true">STYLERENT</span>
        <div className="container position-relative">
          <SectionHeading
            align="center"
            kicker="Simple by design"
            title="How It Works"
            subtitle="Four steps between you and your next unforgettable look."
          />
          <div className="row g-4">
            {howItWorks.map((s, i) => (
              <div className="col-6 col-lg-3" key={s.step}>
                <div className="hiw-card">
                  <span className="hiw-step">{s.step}</span>
                  {i === 0 ? <CalendarHeart size={26} aria-hidden="true" /> : i === 1 ? <Sparkles size={26} aria-hidden="true" /> : i === 2 ? <ShoppingBag size={26} aria-hidden="true" /> : <RotateCcw size={26} aria-hidden="true" />}
                  <h4>{s.title}</h4>
                  <p>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="container section-space">
        <SectionHeading
          align="center"
          kicker="Loved by members"
          title="Renters of StyleRent"
        />
        <div className="row g-3 justify-content-center">
          {[
            {
              name: 'Priya Sharma',
              text: 'Rented the royal ivory lehenga for my sister’s wedding. It arrived steamed, fitted perfectly, and the whole process took minutes. Unreal value.',
            },
            {
              name: 'Karan Singh',
              text: 'The sherwani was pure royalty. Tailoring precise, velvet thick… nobody believed it was a rental. My wardrobe is basically StyleRent now.',
            },
            {
              name: 'Aisha Kapoor',
              text: 'Five weddings in one season without buying a single outfit. The returns are effortless and everything smells couture fresh. Obsessed.',
            },
          ].map((t) => (
            <div className="col-md-4" key={t.name}>
              <figure className="testimonial-card h-100">
                <Quote size={28} className="quote-mark" aria-hidden="true" />
                <figcaption>
                  <Star size={14} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} aria-hidden="true" />
                  <Star size={14} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} aria-hidden="true" />
                  <Star size={14} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} aria-hidden="true" />
                  <Star size={14} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} aria-hidden="true" />
                  <Star size={14} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} aria-hidden="true" />
                </figcaption>
                <blockquote>{t.text}</blockquote>
                <cite>{t.name} · Verified Renter</cite>
              </figure>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="bg-beige section-space">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <SectionHeading
                kicker="Our Story"
                title="Luxury, made reusable."
                subtitle="StyleRent began with a simple frustration — why own a wardrobe you wear ten times? We partner with 500+ Indian ateliers to make designer occasion wear shareable, sustainable and surprisingly affordable."
              />
              <div className="d-flex flex-wrap gap-3 mt-4">
                <div className="about-ribbon">
                  <strong>15k+</strong>
                  <span>Successful rentals</span>
                </div>
                <div className="about-ribbon">
                  <strong>500+</strong>
                  <span>Partner ateliers</span>
                </div>
                <div className="about-ribbon">
                  <strong>9</strong>
                  <span>Hub cities</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-img">
                <SmartImage src={IMAGES.about} alt="StyleRent atelier" className="w-100 h-100" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-band">
        <div className="container text-center">
          <h2>Your next occasion deserves better than your wardrobe.</h2>
          <p>Browse thousands of looks. Rent one you love for the night.</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/clothing" className="btn btn-sr-gold btn-sr-lg">
              Explore Clothing <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/register" className="btn btn-sr-light btn-sr-lg">
              Join StyleRent
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}