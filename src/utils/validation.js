import { isValidDateRange, todayISO } from './dateUtils'

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim())

export const isPhone = (value) => {
  const cleaned = String(value || '').replace(/[\s-]/g, '')
  return /^\+?\d{10,13}$/.test(cleaned)
}

export const required = (value) => {
  const v = String(value ?? '').trim()
  return v.length > 0
}

export const minLength = (value, n) =>
  String(value ?? '').length >= n

// Wrap a field-error map into a predictable result shape used by every form.
const result = (errors) => ({
  valid: Object.keys(errors).length === 0,
  errors,
})

// ---------- Field rule helpers returning user-friendly messages ----------

export const validateLogin = (values) => {
  const errors = {}
  if (!required(values.email)) errors.email = 'Please enter your email address.'
  else if (!isEmail(values.email)) errors.email = 'Please enter a valid email address.'
  if (!required(values.password)) errors.password = 'Please enter your password.'
  return result(errors)
}

export const validateRegister = (values) => {
  const errors = {}
  if (!required(values.name)) errors.name = 'Please enter your full name.'
  else if (String(values.name).trim().length < 3) errors.name = 'Name must be at least 3 characters.'
  if (!required(values.email)) errors.email = 'Please enter your email address.'
  else if (!isEmail(values.email)) errors.email = 'Please enter a valid email address.'
  if (!required(values.password)) errors.password = 'Please create a password.'
  else if (!minLength(values.password, 6)) errors.password = 'Password must be at least 6 characters.'
  if (!required(values.confirmPassword)) errors.confirmPassword = 'Please confirm your password.'
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!required(values.phone)) errors.phone = 'Please enter your phone number.'
  else if (!isPhone(values.phone)) errors.phone = 'Please enter a valid phone number (10-13 digits).'
  if (!required(values.address)) errors.address = 'Please enter your address.'
  return result(errors)
}

export const validateBooking = ({ size, color, startDate, endDate, quantity }) => {
  const errors = {}
  if (!required(size)) errors.size = 'Please select a size.'
  if (!required(color)) errors.color = 'Please select a colour.'
  if (!required(startDate)) errors.startDate = 'Please select a rental start date.'
  else if (String(startDate) < todayISO()) errors.startDate = 'Start date cannot be in the past.'
  if (!required(endDate)) errors.endDate = 'Please select a rental end date.'
  else if (required(startDate) && String(endDate) < String(startDate)) {
    errors.endDate = 'End date must be after the start date.'
  } else if (required(startDate) && !isValidDateRange(startDate, endDate)) {
    errors.endDate = 'Rental must be at least 1 day.'
  }
  if (!quantity || Number(quantity) < 1) errors.quantity = 'Quantity must be at least 1.'
  return result(errors)
}

export const validatePayment = (method, values) => {
  const errors = {}
  if (method === 'Card') {
    const cardNo = String(values.cardNumber || '').replace(/\s/g, '')
    if (!required(cardNo)) errors.cardNumber = 'Please enter your card number.'
    else if (!/^\d{16}$/.test(cardNo)) errors.cardNumber = 'Card number must be 16 digits.'
    if (!isValidExpiry(values.expiry)) errors.expiry = 'Please enter a valid MM/YY expiry.'
    if (!required(values.cvv)) errors.cvv = 'Please enter the CVV.'
    else if (!/^\d{3,4}$/.test(String(values.cvv))) errors.cvv = 'CVV must be 3-4 digits.'
  }
  if (method === 'UPI') {
    if (!required(values.upiId)) errors.upiId = 'Please enter your UPI ID.'
    else if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(String(values.upiId).trim())) {
      errors.upiId = 'Please enter a valid UPI ID (e.g. name@upi).'
    }
  }
  return result(errors)
}

const isValidExpiry = (value) => {
  const m = String(value || '').match(/^(\d{2})\/(\d{2})$/)
  if (!m) return false
  const month = Number(m[1])
  const year = Number(m[2])
  if (month < 1 || month > 12) return false
  const now = new Date()
  const expiry = new Date(2000 + year, month)
  return expiry >= now
}

export const validateReview = ({ rating, comment }) => {
  const errors = {}
  if (!rating || Number(rating) < 1) errors.rating = 'Please select a star rating.'
  if (!required(comment)) errors.comment = 'Please write a short review.'
  else if (String(comment).trim().length < 10) errors.comment = 'Review must be at least 10 characters.'
  return result(errors)
}

export const validateClothingForm = (values) => {
  const errors = {}
  if (!required(values.name)) errors.name = 'Please enter the item name.'
  if (!values.category_id) errors.category_id = 'Please select a category.'
  if (!(Number(values.price_per_day) > 0)) errors.price_per_day = 'Please enter a valid daily price.'
  if (!(Number(values.stock) >= 0)) errors.stock = 'Please enter a valid stock quantity.'
  if (!required(values.color)) errors.color = 'Please enter the colour.'
  if (!required(values.image_url)) errors.image_url = 'Please provide an image URL.'
  return result(errors)
}

export const validateCategoryForm = (values) => {
  const errors = {}
  if (!required(values.category_name)) errors.category_name = 'Please enter a category name.'
  return result(errors)
}

export const isValidUserEmailForRegister = (email, existingUsers) =>
  !existingUsers.some((u) => u.email.toLowerCase() === String(email).toLowerCase())