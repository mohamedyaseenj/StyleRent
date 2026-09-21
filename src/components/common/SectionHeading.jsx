import { Link } from 'react-router-dom'

export default function SectionHeading({ kicker, title, subtitle, linkTo, linkLabel, align = 'left' }) {
  return (
    <div className={`section-head ${align === 'center' ? 'flex-column align-items-center text-center' : ''}`}>
      <div style={{ maxWidth: 720 }}>
        {kicker ? <span className="kicker">{kicker}</span> : null}
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="section-sub">{subtitle}</p> : null}
      </div>
      {linkTo ? (
        <Link to={linkTo} className="link-underline d-inline-flex align-items-center gap-1">
          {linkLabel || 'View All'}
        </Link>
      ) : null}
    </div>
  )
}