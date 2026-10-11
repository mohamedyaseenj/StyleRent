import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardShell from './components/dashboard/DashboardShell'
import { useAuth } from './context/AuthContext'
import { normalizeRole } from './utils/roles'

import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Clothing from './pages/Clothing'
import ClothingDetails from './pages/ClothingDetails'
import Categories from './pages/Categories'
import CategoryProducts from './pages/CategoryProducts'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import RentalSuccess from './pages/RentalSuccess'
import MyRentals from './pages/MyRentals'
import RentalDetails from './pages/RentalDetails'
import UserDashboard from './pages/user/UserDashboard'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Review from './pages/Review'
import NotFound from './pages/NotFound'

import OwnerDashboard from './pages/owner/OwnerDashboard'
import OwnerClothingPage from './pages/owner/OwnerClothing'
import OwnerRentalsPage from './pages/owner/OwnerRentals'
import OwnerRevenue from './pages/owner/OwnerRevenue'

import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminProducts from './pages/Admin/AdminProducts'
import AdminCategories from './pages/Admin/AdminCategories'
import AdminRentals from './pages/Admin/AdminRentals'
import AdminCustomers from './pages/Admin/AdminCustomers'
import AdminReviews from './pages/Admin/AdminReviews'

// Spec roles: USER (customer), HOST (provider), ADMIN.
// 'OWNER' is accepted as a legacy alias of 'HOST' for old bookmarks/sessions.
const HOST_ROLES = ['HOST', 'OWNER']

function expandRoles(roles) {
  if (!roles) return roles
  const out = new Set()
  roles.forEach((r) => {
    out.add(r)
    if (r === 'HOST') out.add('OWNER')
    if (r === 'OWNER') out.add('HOST')
  })
  return [...out]
}

// Guard requiring an authenticated session (optionally a specific role set).
function RequireRole({ roles, children }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  const want = expandRoles(roles)
  if (want && !want.includes(normalizeRole(role))) {
    return <Navigate to="/" replace />
  }
  return children
}

function HostConsole() {
  return (
    <DashboardShell kind="host" title="Host Console" subtitle="Manage your catalogue, rentals and revenue" />
  )
}

function AdminConsole() {
  return (
    <DashboardShell kind="admin" title="Admin Console" subtitle="Platform overview and management" />
  )
}

export default function App() {
  return (
    <Routes>
      {/* ---------------- Spec: role login portals ---------------- */}
      <Route
        path="/host/login"
        element={<Layout />}
      >
        <Route
          index
          element={<Login requiredRole="HOST" title="Host Login" subtitle="Sign in to manage your clothing catalogue." />}
        />
      </Route>
      <Route path="/admin/login" element={<Layout />}>
        <Route
          index
          element={<Login requiredRole="ADMIN" title="Admin Login" subtitle="Sign in to manage the StyleRent platform." />}
        />
      </Route>

      {/* ---------------- Host console (spec canonical /host/*) ---------------- */}
      <Route
        path="/host"
        element={
          <RequireRole roles={HOST_ROLES}>
            <HostConsole />
          </RequireRole>
        }
      >
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="clothing" element={<OwnerClothingPage />} />
        <Route path="clothing/add" element={<OwnerClothingPage />} />
        <Route path="inventory" element={<OwnerClothingPage />} />
        <Route path="rentals" element={<OwnerRentalsPage />} />
        <Route path="revenue" element={<OwnerRevenue />} />
        <Route index element={<Navigate to="/host/dashboard" replace />} />
      </Route>

      {/* Legacy /owner/* aliases (kept working, redirect to /host/*) */}
      <Route path="/owner">
        <Route index element={<Navigate to="/host/dashboard" replace />} />
        <Route path="clothing" element={<Navigate to="/host/clothing" replace />} />
        <Route path="rentals" element={<Navigate to="/host/rentals" replace />} />
        <Route path="revenue" element={<Navigate to="/host/revenue" replace />} />
      </Route>

      {/* ---------------- Admin console (spec canonical /admin/*) ---------------- */}
      <Route
        path="/admin"
        element={
          <RequireRole roles={['ADMIN']}>
            <AdminConsole />
          </RequireRole>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminCustomers />} />
        <Route path="hosts" element={<AdminCustomers />} />
        <Route path="customers" element={<Navigate to="/admin/users" replace />} />
        <Route path="clothing" element={<AdminProducts />} />
        <Route path="products" element={<Navigate to="/admin/clothing" replace />} />
        <Route path="rentals" element={<AdminRentals />} />
        <Route path="payments" element={<AdminRentals />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* ---------------- User area (spec canonical /user/*) ---------------- */}
      <Route element={<Layout />}>
        <Route
          path="/user/dashboard"
          element={
            <RequireRole>
              <UserDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/user/clothing"
          element={
            <RequireRole>
              <Clothing />
            </RequireRole>
          }
        />
        <Route
          path="/user/clothing/:id"
          element={
            <RequireRole>
              <ClothingDetails />
            </RequireRole>
          }
        />
        <Route
          path="/user/rental"
          element={
            <RequireRole>
              <Booking />
            </RequireRole>
          }
        />
        <Route
          path="/user/my-rentals"
          element={
            <RequireRole>
              <MyRentals />
            </RequireRole>
          }
        />
        <Route
          path="/user/profile"
          element={
            <RequireRole>
              <Profile />
            </RequireRole>
          }
        />
      </Route>

      {/* ---------------- Customer / public site ---------------- */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/clothing" element={<Clothing />} />
        <Route path="/clothing/:id" element={<ClothingDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:id" element={<CategoryProducts />} />
        <Route
          path="/wishlist"
          element={
            <RequireRole>
              <Wishlist />
            </RequireRole>
          }
        />

        {/* Authenticated customer routes */}
        <Route
          path="/booking"
          element={
            <RequireRole>
              <Booking />
            </RequireRole>
          }
        />
        <Route
          path="/payment/:id"
          element={
            <RequireRole>
              <Payment />
            </RequireRole>
          }
        />
        <Route
          path="/rental-success/:id"
          element={
            <RequireRole>
              <RentalSuccess />
            </RequireRole>
          }
        />
        <Route
          path="/my-rentals"
          element={
            <RequireRole>
              <MyRentals />
            </RequireRole>
          }
        />
        <Route
          path="/rental/:id"
          element={
            <RequireRole>
              <RentalDetails />
            </RequireRole>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireRole>
              <Profile />
            </RequireRole>
          }
        />
        <Route
          path="/review/:clothingId"
          element={
            <RequireRole>
              <Review />
            </RequireRole>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
