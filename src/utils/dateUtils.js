// Date helpers used across the rental flow.
// All dates are exchanged in ISO 'YYYY-MM-DD' form.

export const toISODate = (date) => {
  if (!date) return null
  // Route ISO strings through local parsing to avoid the UTC-midnight
  // shift of `new Date('YYYY-MM-DD')` in IST.
  if (typeof date === 'string') {
    const m = date.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
  }
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = () => toISODate(new Date())

// Accepts an ISO 'YYYY-MM-DD' string OR a Date. Always interprets the
// calendar day in LOCAL time (never `new Date('YYYY-MM-DD')`, which parses
// as UTC midnight and shifts the day in IST). This keeps <input type="date">
// values and JS Date parsing on the same format.
const toLocalDate = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }
  if (typeof value === 'string') {
    const m = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return null
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export const parseISO = (iso) => {
  if (iso instanceof Date) {
    return Number.isNaN(iso.getTime()) ? null : new Date(iso.getTime())
  }
  return toLocalDate(iso)
}

export const addDaysISO = (iso, days) => {
  const d = parseISO(iso)
  if (!d) return null
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

// Rental day count between two calendar days.
// Accepts ISO strings or Dates (callers historically double-parse, e.g.
// daysBetween(parseISO(a), parseISO(b)) — both forms must work).
// Same-day (end === start) counts as a 1-day rental per the minimum-1-day
// business rule; end before start returns a negative number (invalid).
export const daysBetween = (startISO, endISO) => {
  const s = toLocalDate(startISO)
  const e = toLocalDate(endISO)
  if (!s || !e) return 0
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000)
  if (diff < 0) return diff
  if (diff === 0) return 1
  return diff
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