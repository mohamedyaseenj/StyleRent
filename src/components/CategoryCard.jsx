import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  return (
    <Link to={`/catalog?category=${encodeURIComponent(category.name)}`} className="group">
      <div className="card overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-colors" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h3 className="text-lg font-semibold font-heading mb-1">{category.name}</h3>
            <p className="text-sm text-gray-200">{category.count} items</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
