import { daysBetween } from './dateUtils'

// Indian Rupee formatting with Indian digit grouping (₹1,44,000).
export const formatINR = (value) => {
  const n = Number(value) || 0
  const negative = n < 0
  const abs = Math.round(Math.abs(n))
  const s = String(abs)
  let last3 = s.slice(-3)
  let rest = s.slice(0, -3)
  if (rest) {
    last3 = ',' + last3
    last3 = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last3
  }
  return `${negative ? '−' : ''}₹${last3}`
}

export const toNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

// rentalDays from two dates (minimum 1 when end >= start, 0 when missing).
export const calcRentalDays = (startISO, endISO) => {
  if (!startISO || !endISO) return 0
  const days = daysBetween(startISO, endISO)
  return days >= 1 ? days : 0
}

// totalAmount = pricePerDay x rentalDays x quantity.
// Supports BOTH call shapes used across the app:
//   calcRentalTotal(pricePerDay, days, quantity)   (clothing/booking UI)
//   calcRentalTotal(startISO, endISO, pricePerDay, quantity) (date-based)
export const calcRentalTotal = (a, b, c, d) => {
  if (d !== undefined || (typeof a === 'string' && typeof b === 'string')) {
    const days = calcRentalDays(a, b)
    return toNumber(c) * days * Math.max(1, toNumber(d ?? 1))
  }
  return toNumber(a) * Math.max(0, toNumber(b)) * Math.max(1, toNumber(c ?? 1))
}

export const pricePerDayLabel = (pricePerDay) => `${formatINR(pricePerDay)}/day`