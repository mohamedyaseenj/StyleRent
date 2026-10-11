import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { DataTable } from './StatCard'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'
import Modal from '../common/Modal'
import FormInput from '../common/FormInput'
import SmartImage from '../common/SmartImage'
import { SearchInput } from '../common/SearchBar'
import { products as seedProducts } from '../../data/products'
import { categories } from '../../data/categories'
import { clothingAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { validateClothingForm } from '../../utils/validation'
import { formatINR } from '../../utils/priceUtils'

const EMPTY = {
  clothing_id: null,
  name: '',
  category_id: '',
  price_per_day: '',
  stock: '',
  color: '',
  image_url: '',
  description: '',
}

// Shared catalogue manager used by both the Owner and Admin consoles.
export default function ClothingManager({ title = 'Clothing', subtitle }) {
  const toast = useToast()
  const [list, setList] = useState(() => [...seedProducts])
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [destroyId, setDestroyId] = useState(null)

  const catName = (id) => categories.find((c) => c.category_id === Number(id))?.category_name || '—'

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return list.filter(
      (p) => p.name.toLowerCase().includes(q) || catName(p.category_id).toLowerCase().includes(q),
    )
  }, [list, query])

  const openCreate = () => {
    setForm(EMPTY)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setForm({ ...p, category_id: String(p.category_id), image_url: p.image_url || '' })
    setErrors({})
    setModalOpen(true)
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    const validation = validateClothingForm(form)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: String(form.name).trim(),
        categoryId: Number(form.category_id),
        category_id: Number(form.category_id),
        pricePerDay: Number(form.price_per_day),
        price_per_day: Number(form.price_per_day),
        stock: Number(form.stock),
        color: form.color,
        imageUrl: form.image_url,
        image_url: form.image_url,
        description: form.description || '',
      }
      if (form.clothing_id) {
        const updated = await clothingAPI.update(form.clothing_id, payload)
        setList((prev) =>
          prev.map((p) =>
            p.clothing_id === form.clothing_id ? { ...p, ...updated } : p,
          ),
        )
        toast.success('Listing updated.')
      } else {
        const created = await clothingAPI.create(payload)
        setList((prev) => [created, ...prev])
        toast.success('Listing added.')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err?.message || 'Could not save the listing.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await clothingAPI.remove(destroyId)
      setList((prev) => prev.filter((p) => p.clothing_id !== destroyId))
      toast.info('Listing removed.')
    } catch (err) {
      toast.error(err?.message || 'Could not remove the listing.')
    } finally {
      setDestroyId(null)
    }
  }

  return (
    <div className="card-sr p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">{title}</h5>
          <span className="text-muted-sr small">{subtitle || `${list.length} listings`}</span>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Search listings…" />
          <Button icon={Plus} onClick={openCreate}>Add Listing</Button>
        </div>
      </div>

      <DataTable headers={['Item', 'Category', 'Colour', 'Price/Day', 'Stock', '']}>
        {filtered.map((p) => (
          <tr key={p.clothing_id}>
            <td>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded overflow-hidden flex-shrink-0" style={{ width: 40, height: 52 }}>
                  <SmartImage src={p.image_url} alt={p.name} className="w-100 h-100" />
                </div>
                <span className="small fw-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{p.name}</span>
              </div>
            </td>
            <td className="small">{catName(p.category_id)}</td>
            <td className="small">{p.color}</td>
            <td className="small fw-semibold">{formatINR(p.price_per_day)}</td>
            <td><StatusBadge status={p.stock} type="stock" /></td>
            <td className="text-end text-nowrap">
              <button type="button" className="btn btn-sr-ghost btn-sr-sm" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-sr-ghost btn-sr-sm text-danger" onClick={() => setDestroyId(p.clothing_id)} aria-label={`Delete ${p.name}`}>
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted-sr small">
          <Search size={22} className="d-block mx-auto mb-2" aria-hidden="true" />
          No listings match &ldquo;{query}&rdquo;
        </div>
      ) : null}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.clothing_id ? 'Edit Listing' : 'Add Listing'} size="lg">
        <form onSubmit={save} noValidate>
          <div className="row g-3">
            <div className="col-md-8">
              <FormInput id="oc-name" label="Item Name" required value={form.name} onChange={set('name')} error={errors.name} />
            </div>
            <div className="col-md-4">
              <FormInput id="oc-cat" as="select" label="Category" required value={form.category_id} onChange={set('category_id')} error={errors.category_id}>
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </FormInput>
            </div>
            <div className="col-md-4">
              <FormInput id="oc-price" label="Price / Day (₹)" type="number" required value={form.price_per_day} onChange={set('price_per_day')} error={errors.price_per_day} />
            </div>
            <div className="col-md-4">
              <FormInput id="oc-stock" label="Stock" type="number" required value={form.stock} onChange={set('stock')} error={errors.stock} />
            </div>
            <div className="col-md-4">
              <FormInput id="oc-color" label="Colour" required value={form.color} onChange={set('color')} error={errors.color} />
            </div>
            <div className="col-12">
              <FormInput id="oc-image" label="Image URL" required value={form.image_url} onChange={set('image_url')} error={errors.image_url} />
            </div>
            <div className="col-12">
              <FormInput id="oc-desc" as="textarea" rows={3} label="Description" value={form.description} onChange={set('description')} />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{form.clothing_id ? 'Save Changes' : 'Add Listing'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={destroyId !== null}
        onClose={() => setDestroyId(null)}
        title="Remove listing?"
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button variant="ghost" onClick={() => setDestroyId(null)}>Cancel</Button>
            <Button variant="primary" onClick={confirmDelete}>Remove</Button>
          </div>
        }
      >
        <p className="mb-0 text-muted-sr small">
          This will remove the listing from your catalogue. Existing bookings are unaffected.
        </p>
      </Modal>
    </div>
  )
}