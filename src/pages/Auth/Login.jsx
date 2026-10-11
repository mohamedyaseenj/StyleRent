import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck, UserRound, Store } from 'lucide-react'
import LoginField from '../../components/common/LoginField'
import { validateLogin } from '../../utils/validation'
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext'
import { normalizeRole } from '../../utils/roles'
import { useToast } from '../../context/ToastContext'

export default function Login({ requiredRole, title, subtitle }) {
  const { login, register } = useAuth() // register used for demo fallback
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [demoBusy, setDemoBusy] = useState(null)

  const goHome = (user) => {
    const role = normalizeRole(user?.role)
    if (requiredRole && role !== normalizeRole(requiredRole)) {
      // Logged in but with the wrong role for this portal — send them to their own home.
      if (role === 'HOST') navigate('/host/dashboard')
      else if (role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/user/dashboard')
      return
    }
    if (role === 'HOST') navigate('/host/dashboard')
    else if (role === 'ADMIN') navigate('/admin/dashboard')
    else navigate(redirect)
  }

  const submit = async (e) => {
    e.preventDefault()
    const validation = validateLogin({ email, password })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setSubmitting(true)
    setErrors({})
    try {
      const user = await login(email.trim(), password)
      if (requiredRole && normalizeRole(user?.role) !== normalizeRole(requiredRole)) {
        setErrors({ server: `This portal is for ${requiredRole} accounts. You logged in as ${user?.role}.` })
        toast.error('This account does not have access to this portal.')
        return
      }
      toast.success(`Welcome back, ${user.name}!`)
      goHome(user)
    } catch (err) {
      setErrors({ server: err.message })
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const quickLogin = async (account) => {
    setDemoBusy(account.role)
    setErrors({})
    try {
      const user = await login(account.email, account.password)
      toast.success(`Logged in as ${account.label}`)
      goHome(user)
    } catch {
      // If the demo user was removed, recreate a session through register mock.
      try {
        const user = await register({
          name: account.label,
          email: account.email,
          password: account.password,
        })
        toast.success(`Demo ${account.label} account created`)
        goHome(user)
      } catch (err) {
        setErrors({ server: err.message })
      }
    } finally {
      setDemoBusy(null)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="text-center mb-4">
          <h1 className="login-title">{title || 'Login'}</h1>
          <p className="text-muted-sr small">{subtitle || 'Sign in to continue renting.'}</p>
        </div>

        {errors.server ? (
          <div className="alert alert-danger small py-2" role="alert">
            {errors.server}
          </div>
        ) : null}

        <form onSubmit={submit} noValidate>
          <LoginField
            id="login-email"
            label="Email"
            type="email"
            placeholder="daniel21fisher@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            icon={<Mail size={18} aria-hidden="true" />}
          />
          <LoginField
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
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
          <div className="login-forgot">
            <button
              type="button"
              className="login-forgot-btn"
              onClick={() => toast.info('Password resets are handled by StyleRent support — please contact us.')}
            >
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? (
              'Signing in…'
            ) : (
              <>
                <LogIn size={17} aria-hidden="true" /> Log In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted-sr small">
            New to StyleRent?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="link-gold fw-semibold">
              Create an account
            </Link>
          </span>
        </div>

        <div className="divider-sr mt-4 mb-3">
          <span>Quick demo</span>
        </div>
        <div className="row g-2">
          {DEMO_ACCOUNTS.map((acct) => {
            const Icon = acct.role === 'ADMIN' ? ShieldCheck : acct.role === 'HOST' ? Store : UserRound
            return (
              <div className="col-4" key={acct.role}>
                <button
                  type="button"
                  className="btn btn-sr-light btn-sr-sm w-100 d-flex flex-column align-items-center gap-1 py-3"
                  onClick={() => quickLogin(acct)}
                  disabled={demoBusy !== null}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="small">{acct.label}</span>
                </button>
              </div>
            )
          })}
        </div>
        <p className="text-muted-sr small text-center mt-3 mb-0">
          One tap demo accounts — try the full Store, Owner or Admin experience.
        </p>
      </div>
    </div>
  )
}