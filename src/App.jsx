import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './layouts/Layout'
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Catalog from './pages/Catalog/Catalog'
import ClothingDetails from './pages/Catalog/ClothingDetails'
import Booking from './pages/Rental/Booking'
import Payment from './pages/Rental/Payment'
import CustomerDashboard from './pages/Dashboard/CustomerDashboard'
import RentalDetails from './pages/Dashboard/RentalDetails'
import Profile from './pages/Dashboard/Profile'
import OwnerDashboard from './pages/Dashboard/OwnerDashboard'
import OwnerClothing from './pages/Dashboard/OwnerClothing'
import Inventory from './pages/Dashboard/Inventory'
import AdminDashboard from './pages/Admin/AdminDashboard'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="catalog/:id" element={<ClothingDetails />} />
        <Route path="booking/:id" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="payment" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="rentals" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="rentals/:id" element={
          <ProtectedRoute allowedRoles={['customer', 'owner']}>
            <RentalDetails />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="owner" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="owner/clothing" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerClothing />
          </ProtectedRoute>
        } />
        <Route path="owner/inventory" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
