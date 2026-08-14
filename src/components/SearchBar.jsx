import { FiSearch } from 'react-icons/fi'

export default function SearchBar({ value, onChange, placeholder = 'Search clothing...' }) {
  return (
    <div className="relative">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input pl-12"
      />
    </div>
  )
}
