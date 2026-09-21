import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardShell from './components/dashboard/DashboardShell'
import { useAuth } from './context/AuthContext'

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

// Guard requiring an authenticated session (optionally a specific role set).
function RequireRole({ roles, children }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* ---------------- Owner console ---------------- */}
      <Route
        path="/owner"
        element={
          <RequireRole roles={['OWNER', 'ADMIN']}>
            <DashboardShell kind="owner" title="Owner Console" subtitle="Manage your catalogue, rentals and revenue" />
          </RequireRole>
        }
      >
        <Route index element={<OwnerDashboard />} />
        <Route path="clothing" element={<OwnerClothingPage />} />
        <Route path="rentals" element={<OwnerRentalsPage />} />
        <Route path="revenue" element={<OwnerRevenue />} />
      </Route>

      {/* ---------------- Admin console ---------------- */}
      <Route
        path="/admin"
        element={
          <RequireRole roles={['ADMIN']}>
            <DashboardShell kind="admin" title="Admin Console" subtitle="Platform overview and management" />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="rentals" element={<AdminRentals />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reviews" element={<AdminReviews />} />
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
        <Route path="/wishlist" element={<Wishlist />} />

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