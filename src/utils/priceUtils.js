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

// rentalDays = endDate - startDate (exclusive, minimum 1 when valid)
export const calcRentalDays = (startISO, endISO) =>
  startISO && endISO ? Math.max(0, daysBetween(startISO, endISO)) : 0

// totalAmount = pricePerDay x rentalDays x quantity
export const calcRentalTotal = (startISO, endISO, pricePerDay, quantity) => {
  const days = calcRentalDays(startISO, endISO)
  return toNumber(pricePerDay) * days * Math.max(1, toNumber(quantity))
}

export const pricePerDayLabel = (pricePerDay) => `${formatINR(pricePerDay)}/day`