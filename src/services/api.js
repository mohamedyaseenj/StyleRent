// ============================================================
// StyleRent API service layer
// ----------------------------
// Frontend talks to the FUTURE Spring Boot REST API through these
// modules. Today the app runs in demo mode against local mock data.
//
// If the backend is unreachable (or VITE_API_MOCK=true), every call
// falls back to the bundled mock data — the UI never breaks.
//
// Future endpoints (Spring Boot 3 / JPA):
//   GET  /api/clothing
//   GET  /api/clothing/{id}
//   GET  /api/categories
//   GET  /api/clothing/{id}/availability
//   POST /api/rentals
//   GET  /api/rentals/my
//   GET  /api/rentals/{id}
//   POST /api/payments
//   GET  /api/reviews/clothing/{id}
//   POST /api/auth/login | /api/auth/register
// ============================================================

import axios from 'axios'
import { products, getProductById, getRelatedProducts } from '../data/products'
import { categories, getCategoryById } from '../data/categories'
import { users, getDemoUserByEmail, sanitizeUser } from '../data/users'
import { rentals, getRentalById, getRentalsByUser } from '../data/rentals'
import { payments, getPaymentForRental } from '../data/payments'
import { reviews, getReviewsByClothing, getReviewsByUser } from '../data/reviews'
import { isValidDateRange, daysBetween } from '../utils/dateUtils'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Demo mode: true unless explicitly switched off via env.
const MOCK_MODE = (import.meta.env.VITE_API_MOCK ?? 'true') === 'true'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('sr_session') || 'null')
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

let devNoticeCount = 0
const notifyDev = (label, error) => {
  devNoticeCount += 1
  // Non-blocking — a couple of quiet console notices, nothing loud.
  if (devNoticeCount <= 3) {
    console.warn(
      `[StyleRent DEV] Using mock data for "${label}". Backend at ${API_BASE_URL} is offline or mock mode is on.`,
      error ? error.message : '',
    )
  }
}

// Try the real request first (when backend is connected), else fall back
// to bundled mock data. The app is fully usable in mock mode.
const withFallback = (label, realFn, mockFn) => async (...args) => {
  if (!MOCK_MODE) {
    try {
      return await realFn(...args)
    } catch (error) {
      notifyDev(label, error)
    }
  }
  await wait(280)
  return mockFn(...args)
}

// ------------------------------------------------------------------
// authAPI
// ------------------------------------------------------------------
export const authAPI = {
  login: withFallback(
    'auth.login',
    async (email, password) => {
      const { data } = await http.post('/auth/login', { email, password })
      return data
    },
    async (email, password) => {
      await wait(160)
      const user = getDemoUserByEmail(email)
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password.')
      }
      return { token: `mock-jwt-${user.role}-${Date.now()}`, user: sanitizeUser(user) }
    },
  ),

  register: withFallback(
    'auth.register',
    async (payload) => {
      const { data } = await http.post('/auth/register', payload)
      return data
    },
    async (payload) => {
      await wait(160)
      const exists = getDemoUserByEmail(payload.email)
      if (exists) {
        throw new Error('An account with this email already exists.')
      }
      const newUser = {
        user_id: users.length + 1,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        role: 'USER',
        created_at: new Date().toISOString(),
      }
      return { token: `mock-jwt-USER-${Date.now()}`, user: newUser }
    },
  ),
}

// ------------------------------------------------------------------
// userAPI
// ------------------------------------------------------------------
export const userAPI = {
  getProfile: withFallback(
    'user.getProfile',
    async (userId) => (await http.get(`/users/${userId}`)).data,
    async (userId) => {
      const user = users.find((u) => u.user_id === Number(userId))
      if (!user) throw new Error('User not found.')
      return sanitizeUser(user)
    },
  ),

  updateProfile: withFallback(
    'user.updateProfile',
    async (userId, payload) =>
      (await http.put(`/users/${userId}`, payload)).data,
    async (userId, payload) => {
      await wait(120)
      const idx = users.findIndex((u) => u.user_id === Number(userId))
      if (idx === -1) throw new Error('User not found.')
      users[idx] = { ...users[idx], ...payload }
      return sanitizeUser(users[idx])
    },
  ),

  getAll: withFallback(
    'user.getAll',
    async () => (await http.get('/users')).data,
    async () => users.map(sanitizeUser),
  ),
}

// ------------------------------------------------------------------
// categoryAPI
// ------------------------------------------------------------------
export const categoryAPI = {
  getAll: withFallback(
    'category.getAll',
    async () => (await http.get('/categories')).data,
    async () => categories,
  ),

  getById: withFallback(
    'category.getById',
    async (id) => (await http.get(`/categories/${id}`)).data,
    async (id) => {
      const category = getCategoryById(id)
      if (!category) throw new Error('Category not found.')
      return category
    },
  ),
}

// ------------------------------------------------------------------
// clothingAPI
// ------------------------------------------------------------------
const filterProducts = (params = {}) => {
  let list = [...products]
  const { category_id, search, sort, trending } = params
  if (category_id) list = list.filter((p) => p.category_id === Number(category_id))
  if (search) {
    const q = String(search).toLowerCase()
    list = list.filter(
      (p) =>
        String(p.name).toLowerCase().includes(q) ||
        String(p.description).toLowerCase().includes(q) ||
        String(p.color).toLowerCase().includes(q),
    )
  }
  if (trending) list = list.filter((p) => p.trending)
  if (sort === 'price-asc') list.sort((a, b) => a.price_per_day - b.price_per_day)
  if (sort === 'price-desc') list.sort((a, b) => b.price_per_day - a.price_per_day)
  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
  if (sort === 'newest') list.sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)))
  return list
}

export const clothingAPI = {
  getAll: withFallback(
    'clothing.getAll',
    async (params) => (await http.get('/clothing', { params })).data,
    async (params) => filterProducts(params),
  ),

  getById: withFallback(
    'clothing.getById',
    async (id) => (await http.get(`/clothing/${id}`)).data,
    async (id) => {
      const product = getProductById(id)
      if (!product) throw new Error('Clothing item not found.')
      return product
    },
  ),

  getRelated: withFallback(
    'clothing.getRelated',
    async (id) => (await http.get(`/clothing/${id}/related`)).data,
    async (id, limit = 4) => {
      const product = getProductById(id)
      if (!product) return []
      return getRelatedProducts(product, limit)
    },
  ),

  // Mock availability check — clearly separated from future API logic.
  // In production this calls GET /api/clothing/{id}/availability.
  checkAvailability: withFallback(
    'clothing.checkAvailability',
    async (id, params) => (await http.get(`/clothing/${id}/availability`, { params })).data,
    async (id, query) => {
      await wait(180)
      const { startDate, endDate, size } = query || {}
      const product = getProductById(id)
      if (!product) {
        return { available: false, message: 'Item not found.', remaining: 0 }
      }
      if (!startDate || !endDate) {
        return {
          available: false,
          message: 'Select a start and end date to check availability.',
          remaining: product.stock,
        }
      }
      if (!isValidDateRange(startDate, endDate)) {
        return {
          available: false,
          message: 'Please choose a valid date range (at least 1 day).',
          remaining: product.stock,
        }
      }
      if (size && !product.availableSizes.includes(size)) {
        return { available: false, message: 'This size is not available.', remaining: 0 }
      }
      const days = daysBetween(startDate, endDate)
      // Deterministic pseudo-occupancy so both AVAILABLE and NOT AVAILABLE
      // states can be demonstrated without a real booking engine.
      const seed = (Number(id) * 7 + days * 13 + startDate.length) % 13
      if (seed === 0) {
        return {
          available: false,
          message: 'This piece is already booked for the selected dates.',
          remaining: 0,
        }
      }
      return {
        available: true,
        message: 'Available for your selected dates.',
        remaining: product.stock,
      }
    },
  ),
}

// ------------------------------------------------------------------
// rentalAPI
// ------------------------------------------------------------------
export const rentalAPI = {
  create: withFallback(
    'rental.create',
    async (payload) => (await http.post('/rentals', payload)).data,
    async (payload) => {
      await wait(200)
      const id = 1000 + rentals.length + Math.floor(Math.random() * 900)
      const created = {
        rental_id: id,
        user_id: payload.user_id,
        start_date: payload.start_date,
        end_date: payload.end_date,
        total_amount: payload.total_amount,
        status: 'Confirmed',
        created_at: new Date().toISOString(),
        items: (payload.items || []).map((it, i) => ({
          item_id: 5000 + i + 1,
          rental_id: id,
          clothing_id: it.clothing_id,
          size: it.size,
          quantity: it.quantity,
          price: it.price,
        })),
      }
      rentals.unshift(created)
      return created
    },
  ),

  getMyRentals: withFallback(
    'rental.getMyRentals',
    async () => (await http.get('/rentals/my')).data,
    async (userId) => {
      if (!userId) return []
      return getRentalsByUser(userId)
    },
  ),

  getById: withFallback(
    'rental.getById',
    async (id) => (await http.get(`/rentals/${id}`)).data,
    async (id) => {
      const rental = getRentalById(id)
      if (!rental) throw new Error('Rental not found.')
      return rental
    },
  ),
}

// ------------------------------------------------------------------
// paymentAPI
// ------------------------------------------------------------------
export const paymentAPI = {
  create: withFallback(
    'payment.create',
    async (payload) => (await http.post('/payments', payload)).data,
    async (payload) => {
      await wait(200)
      const created = {
        payment_id: 2000 + payments.length + 1,
        rental_id: payload.rental_id,
        amount: payload.amount,
        payment_method: payload.payment_method,
        payment_date: new Date().toISOString(),
        payment_status: payload.payment_method === 'Cash' ? 'Pending' : 'Paid',
      }
      payments.push(created)
      return created
    },
  ),

  getByRental: withFallback(
    'payment.getByRental',
    async (rentalId) => (await http.get(`/rentals/${rentalId}/payment`)).data,
    async (rentalId) => getPaymentForRental(rentalId),
  ),
}

// ------------------------------------------------------------------
// reviewAPI
// ------------------------------------------------------------------
let reviewSeq = reviews.length + 1
export const reviewAPI = {
  getByClothing: withFallback(
    'review.getByClothing',
    async (clothingId) => (await http.get(`/reviews/clothing/${clothingId}`)).data,
    async (clothingId) => getReviewsByClothing(clothingId),
  ),

  getByUser: withFallback(
    'review.getByUser',
    async (userId) => (await http.get(`/reviews/user/${userId}`)).data,
    async (userId) => getReviewsByUser(userId),
  ),

  getAll: withFallback(
    'review.getAll',
    async () => (await http.get('/reviews')).data,
    async () => reviews,
  ),

  create: withFallback(
    'review.create',
    async (payload) => (await http.post('/reviews', payload)).data,
    async (payload) => {
      await wait(200)
      const created = {
        review_id: reviewSeq++,
        user_id: payload.user_id,
        clothing_id: payload.clothing_id,
        rating: payload.rating,
        comment: payload.comment,
        created_at: new Date().toISOString(),
        reviewer_name: payload.reviewer_name || 'StyleRent Member',
      }
      reviews.unshift(created)
      return created
    },
  ),
}

export const api = http

export default api