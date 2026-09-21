import { Link } from 'react-router-dom'
import { Camera, ThumbsUp, Send, MapPin, Phone, Mail } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Clothing', to: '/clothing' },
      { label: 'Trending', to: '/clothing?trending=1' },
      { label: 'Sarees', to: '/categories/1' },
      { label: 'Lehenga', to: '/categories/2' },
      { label: 'Gowns', to: '/categories/3' },
      { label: 'Sherwani', to: '/categories/5' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'About', to: '/#about' },
      { label: 'Contact', to: '/#about' },
      { label: 'Careers', to: '/' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Rental Policy', to: '/' },
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
      { label: 'Shipping & Returns', to: '/' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer-sr">
      <div className="container footer-top">
        <div className="row g-4">
          <div className="col-lg-4">
            <Link to="/" className="brand-sr mb-3">
              <span className="brand-mark">S</span>
              STYLE<span className="text-gold">RENT</span>
            </Link>
            <p className="footer-note mt-3 mb-4" style={{ maxWidth: 320 }}>
              Rent the Look. Own the Moment. Premium occasion wear from India&rsquo;s
              finest ateliers — delivered to your door, returned with zero fuss.
            </p>
            <div>
              <a href="#" className="social-btn" aria-label="Instagram">
                <Camera size={16} aria-hidden="true" />
              </a>
              <a href="#" className="social-btn" aria-label="Facebook">
                <ThumbsUp size={16} aria-hidden="true" />
              </a>
              <a href="#" className="social-btn" aria-label="Twitter / X">
                <Send size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div className="col-6 col-md-4 col-lg-2" key={col.title}>
              <h6>{col.title}</h6>
              {col.links.map((link) => (
                <Link key={link.label} to={link.to} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="col-6 col-md-4 col-lg-2">
            <h6>Contact</h6>
            <span className="footer-link d-flex align-items-start gap-2">
              <MapPin size={14} className="mt-1 flex-shrink-0" aria-hidden="true" /> Mumbai, India
            </span>
            <a href="tel:+919000000000" className="footer-link d-flex align-items-center gap-2">
              <Phone size={14} aria-hidden="true" /> +91 90000 00000
            </a>
            <a href="mailto:hello@stylerent.com" className="footer-link d-flex align-items-center gap-2">
              <Mail size={14} aria-hidden="true" /> hello@stylerent.com
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <span>© {new Date().getFullYear()} StyleRent. All rights reserved.</span>
          <span>Rent the Look. Own the Moment.</span>
        </div>
      </div>
    </footer>
  )
}