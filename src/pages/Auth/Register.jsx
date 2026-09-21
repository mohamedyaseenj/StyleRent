import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/common/Button'
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
      <div className="auth-card">
        <div className="text-center mb-4">
          <h1 className="auth-title">Create your account</h1>
          <p className="text-muted-sr small">Start renting designer looks in minutes.</p>
        </div>

        {errors.server ? (
          <div className="alert alert-danger small py-2" role="alert">
            {errors.server}
          </div>
        ) : null}

        <form onSubmit={submit} noValidate>
          <FormInput
            id="reg-name"
            label="Full Name"
            placeholder="Priya Sharma"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            autoComplete="name"
          />
          <FormInput
            id="reg-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
          />
          <div className="row g-2">
            <div className="col-12 col-sm-5">
              <FormInput
                id="reg-phone"
                label="Phone"
                type="tel"
                placeholder="+91 9XXXXXXXXX"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
              />
            </div>
            <div className="col-12 col-sm-7">
              <FormInput
                id="reg-address"
                label="City"
                placeholder="Mumbai"
                value={form.address}
                onChange={set('address')}
                error={errors.address}
                autoComplete="address-level2"
              />
            </div>
          </div>
          <FormInput
            id="reg-password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="new-password"
            hint="Use 6+ characters with a letter and a number."
          />
          <FormInput
            id="reg-confirm"
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button type="submit" block loading={submitting} icon={UserPlus}>
            Create Account
          </Button>
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