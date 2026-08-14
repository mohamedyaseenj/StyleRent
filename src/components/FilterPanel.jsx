export default function FilterPanel({ filters, onFilterChange, categories, sizes, colors, priceRange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === category}
                onChange={() => onFilterChange('category', category === filters.category ? '' : category)}
                className="text-accent focus:ring-accent"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onFilterChange('size', filters.size === size ? '' : size)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filters.size === size
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-text border-border hover:border-accent'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onFilterChange('color', filters.color === color ? '' : color)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filters.color === color
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-text border-border hover:border-accent'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          {priceRange.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={filters.priceRange === range.label}
                onChange={() => onFilterChange('priceRange', range.label)}
                className="text-accent focus:ring-accent"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => onFilterChange('availableOnly', e.target.checked)}
            className="text-accent focus:ring-accent rounded"
          />
          <span className="text-sm">Available only</span>
        </label>
      </div>
    </div>
  )
}
