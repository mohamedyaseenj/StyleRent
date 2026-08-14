import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiLock, FiCheck } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import { mockUsers } from '../../data/mockData'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
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
      const exists = mockUsers.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase()
      )

      if (exists) {
        setApiError('An account with this email already exists')
        setIsSubmitting(false)
        return
      }

      const newUser = {
        id: Date.now(),
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      }

      login(newUser)
      const roleRoutes = {
        admin: '/admin',
        owner: '/owner',
        customer: '/rentals',
      }
      navigate(roleRoutes[newUser.role] || '/rentals', { replace: true })
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
              <FiUser className="text-accent" />
              StyleRent
            </Link>
            <h2 className="text-2xl font-bold font-heading">Create Account</h2>
            <p className="text-text-light mt-1">Join StyleRent today</p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              error={errors.fullName}
              required
            />

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
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              error={errors.phone}
              required
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              error={errors.password}
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              required
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-text mb-3">I want to</label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === 'customer'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="border-2 border-gray-200 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white rounded-lg p-3 text-center transition-colors">
                    <span className="font-medium">Rent Clothes</span>
                    <p className="text-xs opacity-80">Customer</p>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={formData.role === 'owner'}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="border-2 border-gray-200 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white rounded-lg p-3 text-center transition-colors">
                    <span className="font-medium">List Items</span>
                    <p className="text-xs opacity-80">Owner</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent ${errors.agreeToTerms ? 'border-danger' : ''}`}
                />
                <span className="text-sm text-text-light">
                  I agree to the{' '}
                  <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="form-error mt-1">{errors.agreeToTerms}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-light">
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
