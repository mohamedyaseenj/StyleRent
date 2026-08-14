import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiCalendar, FiTruck, FiStar, FiHeart, FiShield } from 'react-icons/fi'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import CategoryCard from '../../components/CategoryCard'
import SearchBar from '../../components/SearchBar'
import { clothingItems, categories } from '../../data/mockData'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  const featuredItems = clothingItems.filter((item) => item.featured).slice(0, 4)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`
    } else {
      window.location.href = '/catalog'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative bg-primary text-white py-20 lg:py-32">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6">
              Rent Your Style
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
              Premium fashion rental for every occasion. Discover designer outfits at a fraction of the price.
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for dresses, suits, accessories..."
              />
              <button type="submit" className="btn-gold mt-4 px-8 py-3 rounded-lg font-semibold text-lg w-full md:w-auto">
                Browse Catalog
              </button>
            </form>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <FiStar className="text-gold" /> 4.8/5 Rating
              </span>
              <span className="flex items-center gap-2">
                <FiHeart className="text-gold" /> 10K+ Happy Customers
              </span>
              <span className="flex items-center gap-2">
                <FiShield className="text-gold" /> Premium Quality
              </span>
            </div>
          </div>
        </section>

        <section className="py-16 bg-surface-alt">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Featured Clothing</h2>
              <p className="text-text-light max-w-2xl mx-auto">
                Handpicked styles for your next event. Rent premium pieces from top designers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/catalog" className="btn-outline px-8 py-3 rounded-lg font-semibold inline-block">
                View All Clothing
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Popular Categories</h2>
              <p className="text-text-light max-w-2xl mx-auto">
                Explore our curated collections for every occasion and style.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-surface-alt">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">How It Works</h2>
              <p className="text-text-light max-w-2xl mx-auto">
                Renting designer clothing has never been easier. Follow these simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  <FiSearch />
                </div>
                <h3 className="text-xl font-semibold font-heading mb-2">Browse</h3>
                <p className="text-text-light">
                  Explore our extensive catalog of designer clothing and accessories.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  <FiCalendar />
                </div>
                <h3 className="text-xl font-semibold font-heading mb-2">Select Dates</h3>
                <p className="text-text-light">
                  Choose your rental period and book your favorite pieces for any occasion.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  <FiTruck />
                </div>
                <h3 className="text-xl font-semibold font-heading mb-2">Wear & Return</h3>
                <p className="text-text-light">
                  Receive your order, enjoy your event, and return with our free pickup service.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Why Choose StyleRent</h2>
              <p className="text-text-light max-w-2xl mx-auto">
                We make luxury fashion accessible, sustainable, and hassle-free.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gold bg-opacity-20 text-gold rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <FiStar />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">Premium Quality</h3>
                <p className="text-text-light text-sm">
                  Authentic designer pieces professionally cleaned and maintained.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gold bg-opacity-20 text-gold rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <FiCalendar />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">Flexible Duration</h3>
                <p className="text-text-light text-sm">
                  Rent for 4 days, a week, or a month. You choose what works for you.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gold bg-opacity-20 text-gold rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <FiHeart />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">Free Alterations</h3>
                <p className="text-text-light text-sm">
                  Perfect fit guaranteed with complimentary alterations on select items.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gold bg-opacity-20 text-gold rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <FiShield />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">Eco-Friendly</h3>
                <p className="text-text-light text-sm">
                  Reduce fashion waste by renting instead of buying. Sustainable style.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              Ready to Elevate Your Wardrobe?
            </h2>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Join thousands of fashion-forward individuals who rent designer pieces for every occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog" className="btn-gold px-8 py-3 rounded-lg font-semibold text-lg">
                Start Browsing
              </Link>
              <Link to="/register" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
