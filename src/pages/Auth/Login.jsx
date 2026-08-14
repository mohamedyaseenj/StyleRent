import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import { mockUsers } from '../../data/mockData'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)

    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase()
      )

      if (!user) {
        setApiError('Invalid email or password')
        setIsSubmitting(false)
        return
      }

      const roleRoutes = {
        admin: '/admin',
        owner: '/owner',
        customer: '/rentals',
      }

      login(user)
      navigate(roleRoutes[user.role] || '/rentals', { replace: true })
      setIsSubmitting(false)
    }, 800)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setApiError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold font-heading text-primary mb-2">
              <FiMail className="text-accent" />
              StyleRent
            </Link>
            <h2 className="text-2xl font-bold font-heading">Welcome Back</h2>
            <p className="text-text-light mt-1">Sign in to your account</p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              required
            />

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <span className="text-sm text-text">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-light">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
