import { useState, useMemo } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiList } from 'react-icons/fi'
import Button from '../../components/Button'
import SearchBar from '../../components/SearchBar'
import Modal from '../../components/Modal'
import ProductCard from '../../components/ProductCard'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { clothingItems as initialClothing } from '../../data/mockData'

const emptyForm = {
  name: '',
  category: '',
  price: '',
  sizes: '',
  colors: '',
  description: '',
  image: '',
}

export default function OwnerClothing() {
  const [clothing, setClothing] = useState(initialClothing)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const categories = useMemo(() => {
    const cats = new Set(clothing.map((c) => c.category))
    return Array.from(cats)
  }, [clothing])

  const filtered = useMemo(() => {
    return clothing.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      const matchesAvailability =
        !availabilityFilter ||
        (availabilityFilter === 'available' ? item.available : !item.available)
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [clothing, search, categoryFilter, availabilityFilter])

  const openAdd = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      sizes: item.sizes.join(', '),
      colors: item.colors.join(', '),
      description: item.description,
      image: item.image,
    })
    setIsModalOpen(true)
  }

  const openDelete = (item) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      id: editingItem ? editingItem.id : Date.now(),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description,
      image: form.image || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=800&fit=crop',
      available: editingItem ? editingItem.available : true,
      featured: editingItem ? editingItem.featured : false,
      originalPrice: editingItem ? editingItem.originalPrice : Number(form.price) * 2,
      rating: editingItem ? editingItem.rating : 0,
      reviews: editingItem ? editingItem.reviews : 0,
      images: editingItem ? editingItem.images : [form.image],
      material: editingItem ? editingItem.material : '',
      brand: editingItem ? editingItem.brand : '',
    }

    if (editingItem) {
      setClothing((prev) => prev.map((c) => (c.id === editingItem.id ? payload : c)))
    } else {
      setClothing((prev) => [...prev, payload])
    }

    setIsModalOpen(false)
    setForm(emptyForm)
    setEditingItem(null)
  }

  const confirmDelete = () => {
    if (deletingItem) {
      setClothing((prev) => prev.filter((c) => c.id !== deletingItem.id))
    }
    setIsDeleteOpen(false)
    setDeletingItem(null)
  }

  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (val) => `$${val}` },
    { key: 'sizes', label: 'Sizes', render: (val) => val.join(', ') },
    { key: 'available', label: 'Status', render: (val) => <StatusBadge status={val ? 'available' : 'out_of_stock'} /> },
  ]

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-heading">My Clothing</h1>
            <p className="text-gray-300 mt-2">Manage your clothing inventory</p>
          </div>
          <Button onClick={openAdd}>
            <FiPlus className="mr-2" />
            Add New Clothing
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <SearchBar value={search} onChange={setSearch} placeholder="Search clothing..." />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input py-2 w-auto"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="form-input py-2 w-auto"
              >
                <option value="">All Availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-white' : 'bg-white text-text hover:bg-surface-alt'}`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-accent text-white' : 'bg-white text-text hover:bg-surface-alt'}`}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-text-light">No clothing items found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => (
                <div key={item.id} className="card group">
                  <ProductCard product={item} />
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(item)}>
                      <FiEdit className="mr-1" />
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" className="flex-1" onClick={() => openDelete(item)}>
                      <FiTrash2 className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <DataTable
            columns={tableColumns}
            data={filtered}
            onEdit={openEdit}
            onDelete={openDelete}
            emptyMessage="No clothing items found."
          />
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Clothing' : 'Add New Clothing'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <input
                  className="form-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="form-label">Sizes (comma separated)</label>
                <input
                  className="form-input"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="XS, S, M, L"
                  required
                />
              </div>
              <div>
                <label className="form-label">Colors (comma separated)</label>
                <input
                  className="form-input"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="Red, Blue, Black"
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {form.image && (
              <div>
                <label className="form-label">Image Preview</label>
                <img src={form.image} alt="Preview" className="h-48 w-auto object-cover rounded-lg border border-border" />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingItem ? 'Save Changes' : 'Add Clothing'}</Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Clothing" size="sm">
          <div className="space-y-4">
            <p className="text-text">
              Are you sure you want to delete <span className="font-semibold">{deletingItem?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
