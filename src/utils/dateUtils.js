// Date helpers used across the rental flow.
// All dates are exchanged in ISO 'YYYY-MM-DD' form.

export const toISODate = (date) => {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = () => toISODate(new Date())

export const parseISO = (iso) => {
  if (!iso) return null
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export const addDaysISO = (iso, days) => {
  const d = parseISO(iso)
  if (!d) return null
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

// Exclusive day count between two dates (end - start).
// start=2026-08-15, end=2026-08-18 => 3 rental days.
export const daysBetween = (startISO, endISO) => {
  const s = parseISO(startISO)
  const e = parseISO(endISO)
  if (!s || !e) return 0
  return Math.round((e.getTime() - s.getTime()) / 86400000)
}

export const isValidISO = (iso) => {
  if (!iso) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso)) && !!parseISO(iso)
}

export const isValidDateRange = (startISO, endISO) => {
  if (!isValidISO(startISO) || !isValidISO(endISO)) return false
  return daysBetween(startISO, endISO) >= 1
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const formatDate = (iso) => {
  const d = parseISO(iso)
  if (!d) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const formatDateShort = (iso) => {
  const d = parseISO(iso)
  if (!d) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export const formatDateTime = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${ampm}`
}

export const daysLabel = (days) => (days === 1 ? '1 day' : `${days} days`)