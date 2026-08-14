import { useState } from 'react'
import { FiUser, FiMail, FiPhone, FiLock, FiBell, FiMoon } from 'react-icons/fi'
import Button from '../../components/Button'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    theme: 'light',
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (showPassword && formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (showPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    return newErrors
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSaving(true)
    setTimeout(() => {
      updateUser({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      })
      setIsSaving(false)
      setIsEditing(false)
      setShowPassword(false)
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    }, 800)
  }

  const roleColors = {
    customer: 'bg-blue-100 text-blue-800',
    owner: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-heading">My Profile</h1>
          <p className="text-gray-300 mt-2">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-3xl font-bold font-heading">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading">{user?.name}</h2>
                <p className="text-text-light">{user?.email}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${roleColors[user?.role] || 'bg-gray-100 text-gray-800'}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-heading">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-accent text-sm font-medium hover:underline"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-text-muted" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`form-input pl-10 ${!isEditing ? 'bg-surface-alt' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-text-muted" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`form-input pl-10 ${!isEditing ? 'bg-surface-alt' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-text-muted" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                      className={`form-input pl-10 ${!isEditing ? 'bg-surface-alt' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-heading">Change Password</h2>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-accent text-sm font-medium hover:underline"
              >
                {showPassword ? 'Cancel' : 'Change'}
              </button>
            </div>
            {showPassword && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-text-muted" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="form-input pl-10"
                    />
                  </div>
                  {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
                </div>

                <div>
                  <label className="form-label">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-text-muted" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="form-input pl-10"
                    />
                  </div>
                  {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="form-label">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-text-muted" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input pl-10"
                    />
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}
            {!showPassword && (
              <p className="text-text-light text-sm">Click "Change" to update your password.</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold font-heading mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FiBell className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-text-light">Receive email notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FiMoon className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-text-light">Use dark theme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="theme"
                    checked={formData.theme === 'dark'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        theme: e.target.checked ? 'dark' : 'light',
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                loading={isSaving}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
