import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '../../components/dashboard/StatCard'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import FormInput from '../../components/common/FormInput'
import SmartImage from '../../components/common/SmartImage'
import { SearchInput } from '../../components/common/SearchBar'
import { categories as seedCategories } from '../../data/categories'
import { products } from '../../data/products'
import { useToast } from '../../context/ToastContext'
import { validateCategoryForm } from '../../utils/validation'

const EMPTY = { category_id: null, category_name: '', description: '', image_url: '' }

export default function AdminCategories() {
  const toast = useToast()
  const [list, setList] = useState(seedCategories)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [destroyId, setDestroyId] = useState(null)

  const counts = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      map[p.category_id] = (map[p.category_id] || 0) + 1
    })
    return map
  }, [])

  const filtered = list.filter((c) =>
    c.category_name.toLowerCase().includes(query.toLowerCase()),
  )

  const openCreate = () => {
    setForm(EMPTY)
    setErrors({})
    setOpen(true)
  }

  const openEdit = (c) => {
    setForm({ ...c })
    setErrors({})
    setOpen(true)
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = (e) => {
    e.preventDefault()
    const validation = validateCategoryForm(form)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setSaving(true)
    setTimeout(() => {
      setList((prev) => {
        if (form.category_id) {
          return prev.map((c) => (c.category_id === form.category_id ? { ...c, ...form } : c))
        }
        const nextId = Math.max(...prev.map((c) => c.category_id)) + 1
        return [...prev, { ...form, category_id: nextId, featured: false }]
      })
      setSaving(false)
      setOpen(false)
      toast.success(form.category_id ? 'Category updated.' : 'Category created.')
    }, 350)
  }

  return (
    <div className="card-sr p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">Categories</h5>
          <span className="text-muted-sr small">{list.length} categories</span>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Search categories…" />
          <Button icon={Plus} onClick={openCreate}>Add Category</Button>
        </div>
      </div>

      <DataTable headers={['Category', 'Description', 'Listings', '']}>
        {filtered.map((c) => (
          <tr key={c.category_id}>
            <td>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded overflow-hidden flex-shrink-0" style={{ width: 44, height: 44 }}>
                  <SmartImage src={c.image_url} alt={c.category_name} className="w-100 h-100" />
                </div>
                <div>
                  <strong className="d-block small" style={{ fontFamily: 'var(--font-serif)' }}>{c.category_name}</strong>
                  <span className="text-muted-sr" style={{ fontSize: 12 }}>ID #{c.category_id}</span>
                </div>
              </div>
            </td>
            <td className="small text-muted-sr" style={{ maxWidth: 340 }}>{c.description}</td>
            <td className="small">{counts[c.category_id] || 0}</td>
            <td className="text-end text-nowrap">
              <button type="button" className="btn btn-sr-ghost btn-sr-sm" onClick={() => openEdit(c)} aria-label={`Edit ${c.category_name}`}>
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-sr-ghost btn-sr-sm text-danger" onClick={() => setDestroyId(c.category_id)} aria-label={`Delete ${c.category_name}`}>
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title={form.category_id ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={save} noValidate>
          <FormInput id="ac-name" label="Category Name" required value={form.category_name} onChange={set('category_name')} error={errors.category_name} />
          <FormInput id="ac-image" label="Image URL" value={form.image_url} onChange={set('image_url')} />
          <FormInput id="ac-desc" as="textarea" rows={3} label="Description" value={form.description} onChange={set('description')} />
          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{form.category_id ? 'Save Changes' : 'Create Category'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={destroyId !== null}
        onClose={() => setDestroyId(null)}
        title="Delete category?"
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button variant="ghost" onClick={() => setDestroyId(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setList((prev) => prev.filter((c) => c.category_id !== destroyId))
                toast.info('Category deleted.')
                setDestroyId(null)
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="mb-0 text-muted-sr small">
          Deleting a category does not remove its listings in this demo, but producers would reassign them.
        </p>
      </Modal>
    </div>
  )
}