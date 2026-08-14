import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiStar,
  FiHeart,
  FiShare2,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import StatusBadge from '../../components/StatusBadge'
import ProductCard from '../../components/ProductCard'
import { clothingItems } from '../../data/mockData'

export default function ClothingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [startDate, setStartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  const item = clothingItems.find((c) => c.id === parseInt(id))

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading mb-2">Item Not Found</h2>
          <p className="text-text-light mb-4">The clothing item you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/catalog')} className="btn-primary">
            Back to Catalog
          </button>
        </div>
      </div>
    )
  }

  const relatedItems = clothingItems
    .filter((c) => c.category === item.category && c.id !== item.id)
    .slice(0, 4)

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? item.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === item.images.length - 1 ? 0 : prev + 1))
  }

  const handleRentNow = () => {
    if (!selectedSize || !selectedColor || !startDate || !returnDate) {
      alert('Please select size, color, and dates before proceeding.')
      return
    }
    navigate(`/booking/${item.id}`)
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </button>
            <span className="text-gray-500">/</span>
            <button
              onClick={() => navigate('/catalog')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Catalog
            </button>
            <span className="text-gray-500">/</span>
            <span className="text-white">{item.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-surface-alt">
              <img
                src={item.images[selectedImage]}
                alt={item.name}
                className="w-full h-[500px] object-cover"
              />
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {item.images.length > 1 && (
              <div className="flex gap-3">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={item.available ? 'available' : 'out_of_stock'} />
                <span className="text-sm text-text-light bg-surface-alt px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold font-heading mb-3">{item.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <FiStar className="text-gold fill-current" size={18} />
                  <span className="font-medium">{item.rating}</span>
                </div>
                <span className="text-text-light">({item.reviews} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-accent">${item.price}</span>
                <span className="text-xl text-text-light line-through">${item.originalPrice}</span>
                <span className="text-text-light">/rental</span>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-3">Available Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedSize === size
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-text border-border hover:border-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-3">Available Colors</h3>
              <div className="flex flex-wrap gap-2">
                {item.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedColor === color
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-text border-border hover:border-accent'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-text-light leading-relaxed">{item.description}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-text-light">Material</p>
                  <p className="font-medium">{item.material}</p>
                </div>
                <div>
                  <p className="text-sm text-text-light">Brand</p>
                  <p className="font-medium">{item.brand}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Rental Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="form-label">Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="form-input"
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-light">
                  <FiTruck size={16} />
                  <span>Free shipping & returns</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-light">
                  <FiShield size={16} />
                  <span>Damage protection</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-light">
                  <FiRefreshCw size={16} />
                  <span>Free exchanges</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRentNow}
                  className="btn-primary flex-1"
                  disabled={!item.available}
                >
                  {item.available ? 'Rent Now' : 'Out of Stock'}
                </button>
                <button className="btn-outline px-4">
                  <FiHeart size={20} />
                </button>
                <button className="btn-outline px-4">
                  <FiShare2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-heading mb-6">Related Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem) => (
                <ProductCard key={relatedItem.id} product={relatedItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
