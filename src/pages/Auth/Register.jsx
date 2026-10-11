import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, UserPlus, UserRound } from 'lucide-react'
import LoginField from '../../components/common/LoginField'
import { validateRegister } from '../../utils/validation'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const validation = validateRegister(form)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setSubmitting(true)
    setErrors({})
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        address: form.address,
        password: form.password,
      })
      toast.success(`Welcome to StyleRent, ${user.name}!`)
      navigate(user?.role && user.role !== 'USER' ? `/${user.role.toLowerCase()}` : redirect)
    } catch (err) {
      setErrors({ server: err.message })
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="text-center mb-4">
          <h1 className="login-title">Create your account</h1>
          <p className="text-muted-sr small">Start renting designer looks in minutes.</p>
        </div>

        {errors.server ? (
          <div className="alert alert-danger small py-2" role="alert">
            {errors.server}
          </div>
        ) : null}

        <form onSubmit={submit} noValidate>
          <LoginField
            id="reg-name"
            label="Full Name"
            placeholder="Priya Sharma"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            autoComplete="name"
            icon={<UserRound size={18} aria-hidden="true" />}
          />
          <LoginField
            id="reg-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
            icon={<Mail size={18} aria-hidden="true" />}
          />
          <div className="row g-2">
            <div className="col-12 col-sm-5">
              <LoginField
                id="reg-phone"
                label="Phone"
                type="tel"
                placeholder="+91 9XXXXXXXXX"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
                icon={<Phone size={18} aria-hidden="true" />}
              />
            </div>
            <div className="col-12 col-sm-7">
              <LoginField
                id="reg-address"
                label="City"
                placeholder="Mumbai"
                value={form.address}
                onChange={set('address')}
                error={errors.address}
                autoComplete="address-level2"
                icon={<MapPin size={18} aria-hidden="true" />}
              />
            </div>
          </div>
          <LoginField
            id="reg-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="new-password"
            icon={<LockKeyhole size={18} aria-hidden="true" />}
            trailing={
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            }
          />
          <LoginField
            id="reg-confirm"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
            icon={<LockKeyhole size={18} aria-hidden="true" />}
          />
          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? (
              'Creating account…'
            ) : (
              <>
                <UserPlus size={17} aria-hidden="true" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted-sr small">
            Already a member?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="link-gold fw-semibold">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}