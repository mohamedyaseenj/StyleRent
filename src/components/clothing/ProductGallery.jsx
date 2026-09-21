import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SmartImage from '../common/SmartImage'

// Main image + thumbnails for the detail page.
// Accepts gallery (array of URL strings) and the primary URL.
export default function ProductGallery({ images = [], alt }) {
  const [active, setActive] = useState(0)
  const list = images.filter(Boolean)

  const showPrev = () => setActive((i) => (i - 1 + list.length) % list.length)
  const showNext = () => setActive((i) => (i + 1) % list.length)

  if (!list.length) return null

  return (
    <div className="gallery-sr">
      <div className="gallery-main">
        <button type="button" className="gallery-arrow left" onClick={showPrev} aria-label="Previous image">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <SmartImage src={list[active]} alt={`${alt} — view ${active + 1}`} className="w-100 h-100" />
        <button type="button" className="gallery-arrow right" onClick={showNext} aria-label="Next image">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="gallery-thumbs">
        {list.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className={`gallery-thumb ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === active}
          >
            <SmartImage src={src} alt="" className="w-100 h-100" />
          </button>
        ))}
      </div>
    </div>
  )
}