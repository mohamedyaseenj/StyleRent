// ============================================================
// StyleRent API service layer
// ----------------------------
// Frontend talks to the Spring Boot REST API through these modules.
// Every call tries the real endpoint first and falls back to bundled
// mock data when the backend is offline or VITE_API_MOCK=true.
//
// Backend base: https://stylerent-backend.onrender.com/api  (see VITE_API_BASE_URL)
// Auth: JWT Bearer token stored in sr_session.
// Roles (canonical): USER = customer, HOST = provider, ADMIN.
// ============================================================

import axios from 'axios'
import { products, getProductById, getRelatedProducts } from '../data/products'
import { categories, getCategoryById } from '../data/categories'
import { users, getDemoUserByEmail, sanitizeUser } from '../data/users'
import { rentals, getRentalById, getRentalsByUser } from '../data/rentals'
import { payments, getPaymentForRental } from '../data/payments'
import { reviews, getReviewsByClothing, getReviewsByUser } from '../data/reviews'
import { normalizeRole } from '../utils/roles'
import { isValidDateRange, daysBetween } from '../utils/dateUtils'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://stylerent-backend.onrender.com/api'

// Demo mode: true unless explicitly switched off via env.
const MOCK_MODE = (import.meta.env.VITE_API_MOCK ?? 'true') === 'true'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem('sr_session') || 'null')
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`
    }
  } catch {
    /* ignore corrupt session */
  }
  return config
})

// Spring Boot wraps every response in ApiResponse { success, message, data }.
const unwrap = (response) => {
  const body = response?.data
  if (body && typeof body === 'object' && 'data' in body) return body.data
  return body
}

const apiError = (error) => {
  const body = error?.response?.data
  const message =
    body?.message || error?.message || 'Something went wrong. Please try again.'
  throw new Error(message)
}

// Host-added clothing is mirrored to localStorage so it survives refresh
// while the Spring Boot backend is offline (mock mode). Seed items excluded.
const CUSTOM_CLOTHING_KEY = 'sr_custom_products'
const persistCustomClothing = () => {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(
      CUSTOM_CLOTHING_KEY,
      JSON.stringify(products.filter((p) => p.custom)),
    )
  } catch {
    /* storage blocked/full: keep in-memory catalogue only */
  }
}

// ---------- Normalizers: backend (camelCase) -> UI (snake_case + camelCase) ----------

const normalizeUser = (u) => {
  if (!u) return u
  const safe = { ...u }
  delete safe.password
  const userId = u.id ?? u.user_id
  const created = u.createdAt ?? u.created_at
  return {
    ...safe,
    role: normalizeRole ? normalizeRole(u.role) : u.role,
    user_id: userId,
    id: userId,
    created_at: created,
    createdAt: created,
  }
}

const normalizeCategory = (c) => {
  if (!c) return c
  const id = c.id ?? c.category_id
  const name = c.name ?? c.category_name
  return {
    ...c,
    category_id: id,
    id,
    category_name: name,
    name,
  }
}

const normalizeClothing = (c) => {
  if (!c) return c
  const id = c.id ?? c.clothing_id
  const categoryId = c.categoryId ?? c.category_id
  const categoryName = c.categoryName ?? c.category_name ?? c.category
  const hostId = c.hostId ?? c.host_id
  const hostName = c.hostName ?? c.host_name
  const pricePerDay = c.pricePerDay ?? c.price_per_day
  const price1Day = c.price1Day ?? c.price_1_day ?? pricePerDay
  const price2Day = c.price2Day ?? c.price_2_day
  const price3Day = c.price3Day ?? c.price_3_day
  const price1Week = c.price1Week ?? c.price_1_week
  const imageUrl = c.imageUrl ?? c.image_url
  const sizes = Array.isArray(c.sizes) ? c.sizes : []
  const availableSizes =
    c.availableSizes ??
    (sizes.length > 0 ? sizes.map((s) => s.size ?? s) : ['S', 'M', 'L'])
  return {
    ...c,
    clothing_id: id,
    id,
    category_id: categoryId,
    categoryId,
    category_name: categoryName,
    categoryName,
    category: categoryName,
    host_id: hostId,
    hostId,
    host_name: hostName,
    hostName,
    price_per_day: pricePerDay,
    pricePerDay,
    price_1_day: price1Day,
    price1Day,
    price_2_day: price2Day,
    price2Day,
    price_3_day: price3Day,
    price3Day,
    price_1_week: price1Week,
    price1Week,
    image_url: imageUrl,
    imageUrl,
    availableSizes,
    rating: c.rating ?? 4.5,
    reviewCount: c.reviewCount ?? 0,
    gender: c.gender ?? 'Women',
  }
}

const normalizeRentalItem = (it, rentalId) => ({
  item_id: it.id ?? it.item_id,
  rental_id: it.rentalId ?? rentalId ?? it.rental_id,
  clothing_id: it.clothingId ?? it.clothing_id,
  size: it.size,
  quantity: it.quantity,
  price: it.subtotal ?? it.pricePerDay ?? it.price,
  pricePerDay: it.pricePerDay,
  subtotal: it.subtotal,
  ...it,
})

const normalizeRental = (r) => {
  if (!r) return r
  const id = r.id ?? r.rental_id
  const userId = r.userId ?? r.user_id
  const start = r.startDate ?? r.start_date
  const end = r.endDate ?? r.end_date
  const total = r.totalAmount ?? r.total_amount
  const created = r.createdAt ?? r.created_at
  return {
    ...r,
    rental_id: id,
    id,
    user_id: userId,
    userId,
    start_date: start,
    startDate: start,
    end_date: end,
    endDate: end,
    total_amount: total,
    totalAmount: total,
    created_at: created,
    createdAt: created,
    items: Array.isArray(r.items)
      ? r.items.map((it) => normalizeRentalItem(it, id))
      : [],
  }
}

const normalizePayment = (p) => {
  if (!p) return p
  const id = p.id ?? p.payment_id
  const rentalId = p.rentalId ?? p.rental_id
  const method = p.paymentMethod ?? p.payment_method
  const date = p.paymentDate ?? p.payment_date
  const status = p.paymentStatus ?? p.payment_status
  return {
    ...p,
    payment_id: id,
    id,
    rental_id: rentalId,
    rentalId,
    payment_method: method,
    paymentMethod: method,
    payment_date: date,
    paymentDate: date,
    payment_status: status,
    paymentStatus: status,
  }
}

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

let devNoticeCount = 0
const notifyDev = (label, error) => {
  devNoticeCount += 1
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
      // Auth errors (401/403/400) are real answers — surface them, don't mock.
      const status = error?.response?.status
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        apiError(error)
      }
      notifyDev(label, error)
    }
  }
  await wait(280)
  return mockFn(...args)
}

// ------------------------------------------------------------------
// authAPI  (spec: POST /api/auth/register, POST /api/auth/login)
// ------------------------------------------------------------------
export const authAPI = {
  login: withFallback(
    'auth.login',
    async (email, password) => {
      try {
        const res = await http.post('/auth/login', { email, password })
        const payload = unwrap(res) // { token, tokenType, user }
        return { token: payload.token, user: normalizeUser(payload.user) }
      } catch (error) {
        apiError(error)
      }
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
      try {
        // Backend always creates USER role; response is ApiResponse<UserResponse> (no token).
        await http.post('/auth/register', {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          address: payload.address,
        })
        // Auto-login so the new user gets a JWT session like the mock flow.
        const loginRes = await http.post('/auth/login', {
          email: payload.email,
          password: payload.password,
        })
        const data = unwrap(loginRes)
        return { token: data.token, user: normalizeUser(data.user) }
      } catch (error) {
        apiError(error)
      }
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
// userAPI  (spec: GET /api/users/profile, GET /api/users/rentals)
// ------------------------------------------------------------------
export const userAPI = {
  getProfile: withFallback(
    'user.getProfile',
    async () => {
      try {
        const res = await http.get('/users/profile')
        return normalizeUser(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (userId) => {
      const user = users.find((u) => u.user_id === Number(userId))
      if (!user) throw new Error('User not found.')
      return sanitizeUser(user)
    },
  ),

  updateProfile: withFallback(
    'user.updateProfile',
    async (_userId, payload) => {
      try {
        const res = await http.put('/users/me', payload)
        return normalizeUser(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
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
    async () => {
      try {
        const res = await http.get('/users')
        return (unwrap(res) || []).map(normalizeUser)
      } catch (error) {
        apiError(error)
      }
    },
    async () => users.map(sanitizeUser),
  ),
}

// ------------------------------------------------------------------
// categoryAPI  (spec: GET /api/categories)
// ------------------------------------------------------------------
export const categoryAPI = {
  getAll: withFallback(
    'category.getAll',
    async () => {
      try {
        const res = await http.get('/categories')
        return (unwrap(res) || []).map(normalizeCategory)
      } catch (error) {
        apiError(error)
      }
    },
    async () => categories,
  ),

  getById: withFallback(
    'category.getById',
    async (id) => {
      try {
        const res = await http.get(`/categories/${id}`)
        return normalizeCategory(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (id) => {
      const category = getCategoryById(id)
      if (!category) throw new Error('Category not found.')
      return category
    },
  ),
}

// ------------------------------------------------------------------
// clothingAPI  (spec: GET /api/clothing, GET /api/clothing/{id},
//                     GET /api/clothing/{id}/availability)
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
    async (params = {}) => {
      try {
        // Backend supports: name, category, color, minPrice, maxPrice.
        const query = {}
        if (params.search) query.name = params.search
        if (params.color) query.color = params.color
        if (params.minPrice) query.minPrice = params.minPrice
        if (params.maxPrice) query.maxPrice = params.maxPrice
        const res = await http.get('/clothing', { params: query })
        let list = (unwrap(res) || []).map(normalizeClothing)
        // Apply UI-only filters client-side for parity with mock mode.
        if (params.category_id) {
          list = list.filter((p) => Number(p.category_id) === Number(params.category_id))
        }
        if (params.trending) list = list.filter((p) => p.trending)
        if (params.sort === 'price-asc') list.sort((a, b) => a.price_per_day - b.price_per_day)
        if (params.sort === 'price-desc') list.sort((a, b) => b.price_per_day - a.price_per_day)
        return list
      } catch (error) {
        apiError(error)
      }
    },
    async (params) => filterProducts(params),
  ),

  getById: withFallback(
    'clothing.getById',
    async (id) => {
      try {
        const res = await http.get(`/clothing/${id}`)
        return normalizeClothing(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (id) => {
      const product = getProductById(id)
      if (!product) throw new Error('Clothing item not found.')
      return product
    },
  ),

  getRelated: withFallback(
    'clothing.getRelated',
    async (id) => {
      try {
        const res = await http.get(`/clothing/${id}`)
        const current = normalizeClothing(unwrap(res))
        const allRes = await http.get('/clothing')
        const all = (unwrap(allRes) || []).map(normalizeClothing)
        return all.filter((p) => p.clothing_id !== current.clothing_id).slice(0, 4)
      } catch (error) {
        apiError(error)
      }
    },
    async (id, limit = 4) => {
      const product = getProductById(id)
      if (!product) return []
      return getRelatedProducts(product, limit)
    },
  ),

  // Production: GET /api/clothing/{id}/availability?startDate&endDate&size
  checkAvailability: withFallback(
    'clothing.checkAvailability',
    async (id, query = {}) => {
      try {
        const { startDate, endDate, size } = query
        const res = await http.get(`/clothing/${id}/availability`, {
          params: { startDate, endDate, size: size || 'M', requestedQuantity: 1 },
        })
        const data = unwrap(res)
        return {
          available: data.available,
          message: data.message,
          remaining: data.availableQuantity ?? data.remaining ?? 0,
        }
      } catch (error) {
        apiError(error)
      }
    },
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

  create: withFallback(
    'clothing.create',
    async (payload) => {
      try {
        const res = await http.post('/host/clothing', payload)
        return normalizeClothing(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (payload = {}) => {
      await wait(200)
      const nextId =
        products.reduce((m, p) => Math.max(m, Number(p.clothing_id) || 0), 0) + 1
      const imageUrl = payload.imageUrl ?? payload.image_url ?? ''
      const created = {
        clothing_id: nextId,
        custom: true,
        category_id: Number(payload.categoryId ?? payload.category_id ?? 1),
        name: payload.name ?? 'Untitled Look',
        description: payload.description ?? '',
        price_per_day: Number(payload.pricePerDay ?? payload.price_per_day ?? 0),
        price_1_day:
          payload.price1Day ??
          payload.price_1_day ??
          payload.pricePerDay ??
          payload.price_per_day,
        price_2_day: payload.price2Day ?? payload.price_2_day,
        price_3_day: payload.price3Day ?? payload.price_3_day,
        price_1_week: payload.price1Week ?? payload.price_1_week,
        color: payload.color ?? '',
        colorHex: payload.colorHex ?? payload.color_hex ?? '#d9d9d9',
        stock: Number(payload.stock ?? 0),
        image_url: imageUrl,
        availableSizes:
          payload.availableSizes ??
          (Array.isArray(payload.sizes)
            ? payload.sizes.map((s) => s?.size ?? s)
            : ['S', 'M', 'L']),
        gender: payload.gender ?? 'Women',
        rating: payload.rating ?? 5,
        reviewCount: payload.reviewCount ?? 0,
        tags: payload.tags ?? ['NEW'],
        featured: payload.featured ?? false,
        trending: payload.trending ?? false,
        start_date:
          payload.start_date ?? new Date().toISOString().slice(0, 10),
        gallery: payload.gallery ?? (imageUrl ? [imageUrl] : []),
      }
      products.unshift(created)
      persistCustomClothing()
      return created
    },
  ),

  update: withFallback(
    'clothing.update',
    async (id, payload) => {
      try {
        const res = await http.put(`/host/clothing/${id}`, payload)
        return normalizeClothing(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (id, payload = {}) => {
      await wait(200)
      const idx = products.findIndex((p) => p.clothing_id === Number(id))
      if (idx === -1) throw new Error('Clothing item not found.')
      const current = products[idx]
      const merged = {
        ...current,
        ...payload,
        // Keep snake_case (UI) and camelCase (backend) aliases in sync.
        category_id: Number(
          payload.categoryId ?? payload.category_id ?? current.category_id,
        ),
        price_per_day: Number(
          payload.pricePerDay ?? payload.price_per_day ?? current.price_per_day,
        ),
        image_url: payload.imageUrl ?? payload.image_url ?? current.image_url,
        stock:
          payload.stock !== undefined ? Number(payload.stock) : current.stock,
        gender: payload.gender ?? current.gender,
      }
      products[idx] = merged
      persistCustomClothing()
      return merged
    },
  ),

  remove: withFallback(
    'clothing.remove',
    async (id) => {
      try {
        await http.delete(`/host/clothing/${id}`)
        return { success: true }
      } catch (error) {
        apiError(error)
      }
    },
    async (id) => {
      await wait(200)
      const idx = products.findIndex((p) => p.clothing_id === Number(id))
      if (idx !== -1) products.splice(idx, 1)
      persistCustomClothing()
      return { success: true }
    },
  ),
}

// ------------------------------------------------------------------
// rentalAPI  (spec: POST /api/rentals, GET /api/rentals/my,
//                  GET /api/rentals/{id}, PUT /api/rentals/{id}/cancel)
// ------------------------------------------------------------------
export const rentalAPI = {
  create: withFallback(
    'rental.create',
    async (payload) => {
      try {
        // UI payload uses snake_case; backend RentalRequest uses camelCase.
        const body = payload.clothing_id
          ? {
              startDate: payload.start_date,
              endDate: payload.end_date,
              items: [
                {
                  clothingId: payload.clothing_id,
                  size: payload.size,
                  quantity: payload.quantity ?? 1,
                },
              ],
            }
          : {
              startDate: payload.startDate ?? payload.start_date,
              endDate: payload.endDate ?? payload.end_date,
              items: (payload.items || []).map((it) => ({
                clothingId: it.clothing_id ?? it.clothingId,
                size: it.size,
                quantity: it.quantity ?? 1,
              })),
            }
        const res = await http.post('/rentals', body)
        return normalizeRental(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
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
    async () => {
      try {
        const res = await http.get('/rentals/my')
        return (unwrap(res) || []).map(normalizeRental)
      } catch (error) {
        apiError(error)
      }
    },
    async (userId) => {
      if (!userId) return []
      return getRentalsByUser(userId)
    },
  ),

  getById: withFallback(
    'rental.getById',
    async (id) => {
      try {
        const res = await http.get(`/rentals/${id}`)
        return normalizeRental(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (id) => {
      const rental = getRentalById(id)
      if (!rental) throw new Error('Rental not found.')
      return rental
    },
  ),

  cancel: withFallback(
    'rental.cancel',
    async (id) => {
      try {
        const res = await http.put(`/rentals/${id}/cancel`)
        return normalizeRental(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (id) => {
      await wait(200)
      const rental = getRentalById(id)
      if (!rental) throw new Error('Rental not found.')
      rental.status = 'Cancelled'
      return rental
    },
  ),
}

// ------------------------------------------------------------------
// paymentAPI  (spec: payments visible under admin + rental checkout)
// ------------------------------------------------------------------
export const paymentAPI = {
  create: withFallback(
    'payment.create',
    async (payload) => {
      try {
        const body = {
          rentalId: payload.rental_id ?? payload.rentalId,
          amount: payload.amount,
          paymentMethod: payload.payment_method ?? payload.paymentMethod ?? 'Card',
        }
        const res = await http.post('/payments', body)
        return normalizePayment(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
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
    async (rentalId) => {
      try {
        const res = await http.get(`/payments/rental/${rentalId}`)
        return (unwrap(res) || []).map(normalizePayment)
      } catch (error) {
        apiError(error)
      }
    },
    async (rentalId) => {
      const found = getPaymentForRental(rentalId)
      return found ? [found] : []
    },
  ),
}

// ------------------------------------------------------------------
// hostAPI  (spec: GET /api/host/dashboard, /api/host/clothing,
//                /api/host/rentals, /api/host/revenue)
// ------------------------------------------------------------------
export const hostAPI = {
  dashboard: withFallback(
    'host.dashboard',
    async () => {
      try {
        return unwrap(await http.get('/host/dashboard'))
      } catch (error) {
        apiError(error)
      }
    },
    async () => ({
      totalClothing: products.length,
      totalRentals: rentals.length,
      totalRevenue: 0,
      activeRentals: 0,
      pendingRentals: 0,
      totalAvailableStock: products.reduce((s, p) => s + (p.stock || 0), 0),
    }),
  ),

  clothing: withFallback(
    'host.clothing',
    async () => {
      try {
        return (unwrap(await http.get('/host/clothing')) || []).map(normalizeClothing)
      } catch (error) {
        apiError(error)
      }
    },
    async () => [...products],
  ),

  rentals: withFallback(
    'host.rentals',
    async () => {
      try {
        return (unwrap(await http.get('/host/rentals')) || []).map(normalizeRental)
      } catch (error) {
        apiError(error)
      }
    },
    async () => [...rentals],
  ),

  revenue: withFallback(
    'host.revenue',
    async () => {
      try {
        return unwrap(await http.get('/host/revenue'))
      } catch (error) {
        apiError(error)
      }
    },
    async () => ({ totalRevenue: 0 }),
  ),
}

// ------------------------------------------------------------------
// adminAPI  (spec: GET /api/admin/dashboard, /users, /hosts,
//                 /clothing, /rentals, /payments)
// ------------------------------------------------------------------
export const adminAPI = {
  dashboard: withFallback(
    'admin.dashboard',
    async () => {
      try {
        return unwrap(await http.get('/admin/dashboard'))
      } catch (error) {
        apiError(error)
      }
    },
    async () => ({
      totalUsers: users.length,
      totalHosts: 1,
      totalClothing: products.length,
      totalRentals: rentals.length,
      totalRevenue: 0,
    }),
  ),

  users: withFallback(
    'admin.users',
    async () => {
      try {
        return (unwrap(await http.get('/admin/users')) || []).map(normalizeUser)
      } catch (error) {
        apiError(error)
      }
    },
    async () => users.map(sanitizeUser),
  ),

  hosts: withFallback(
    'admin.hosts',
    async () => {
      try {
        return (unwrap(await http.get('/admin/hosts')) || []).map(normalizeUser)
      } catch (error) {
        apiError(error)
      }
    },
    async () => users.filter((u) => u.role === 'HOST').map(sanitizeUser),
  ),

  clothing: withFallback(
    'admin.clothing',
    async () => {
      try {
        return (unwrap(await http.get('/admin/clothing')) || []).map(normalizeClothing)
      } catch (error) {
        apiError(error)
      }
    },
    async () => [...products],
  ),

  rentals: withFallback(
    'admin.rentals',
    async () => {
      try {
        return (unwrap(await http.get('/admin/rentals')) || []).map(normalizeRental)
      } catch (error) {
        apiError(error)
      }
    },
    async () => [...rentals],
  ),

  payments: withFallback(
    'admin.payments',
    async () => {
      try {
        return (unwrap(await http.get('/admin/payments')) || []).map(normalizePayment)
      } catch (error) {
        apiError(error)
      }
    },
    async () => [...payments],
  ),

  setUserStatus: withFallback(
    'admin.setUserStatus',
    async (id, active) => {
      try {
        const res = await http.put(`/admin/users/${id}/status`, null, {
          params: { active },
        })
        return normalizeUser(unwrap(res))
      } catch (error) {
        apiError(error)
      }
    },
    async (id, active) => {
      const user = users.find((u) => u.user_id === Number(id))
      if (!user) throw new Error('User not found.')
      user.is_active = active
      return sanitizeUser(user)
    },
  ),
}

// ------------------------------------------------------------------
// reviewAPI
// ------------------------------------------------------------------
let reviewSeq = reviews.length + 1
export const reviewAPI = {
  getByClothing: withFallback(
    'review.getByClothing',
    async (clothingId) => {
      try {
        return unwrap(await http.get(`/reviews/clothing/${clothingId}`))
      } catch (error) {
        apiError(error)
      }
    },
    async (clothingId) => getReviewsByClothing(clothingId),
  ),

  getByUser: withFallback(
    'review.getByUser',
    async (userId) => {
      try {
        return unwrap(await http.get(`/reviews/user/${userId}`))
      } catch (error) {
        apiError(error)
      }
    },
    async (userId) => getReviewsByUser(userId),
  ),

  getAll: withFallback(
    'review.getAll',
    async () => {
      try {
        return unwrap(await http.get('/reviews'))
      } catch (error) {
        apiError(error)
      }
    },
    async () => reviews,
  ),

  create: withFallback(
    'review.create',
    async (payload) => {
      try {
        const res = await http.post('/reviews', payload)
        return unwrap(res)
      } catch (error) {
        apiError(error)
      }
    },
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
