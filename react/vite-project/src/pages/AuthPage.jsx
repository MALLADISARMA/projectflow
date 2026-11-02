import { useState } from 'react'
import { FolderKanban, LoaderCircle } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const { authenticate, token, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token && !authLoading) return <Navigate to="/projects" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const credentials = isSignup
        ? { ...form, email: form.email.trim() }
        : { email: form.email.trim(), password: form.password }
      await authenticate(isSignup ? 'signup' : 'login', credentials)
      const returnTo = location.state?.from
      navigate(returnTo ? `${returnTo.pathname}${returnTo.search || ''}` : '/projects', {
        replace: true,
      })
    } catch (requestError) {
      setError(requestError.message || 'Unable to authenticate. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" to="/" aria-label="ProjectFlow home">
          <span className="brand-mark" aria-hidden="true"><FolderKanban size={19} /></span>
          <span>ProjectFlow</span>
        </Link>
        <p className="eyebrow">{isSignup ? 'Get started' : 'Your workspace'}</p>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="page-description">
          {isSignup
            ? 'Create an account to plan projects and work together.'
            : 'Sign in to pick up where you left off.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Full name
              <input
                autoComplete="name"
                maxLength={100}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                required
                value={form.fullName}
              />
            </label>
          )}
          <label>
            Email address
            <input
              autoComplete="email"
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 8 : undefined}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
              type="password"
              value={form.password}
            />
            {isSignup && <span className="field-hint">Use at least 8 characters.</span>}
          </label>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="primary-button full-width" disabled={submitting} type="submit">
            {submitting && <LoaderCircle className="spin" size={16} />}
            {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : 'New to ProjectFlow?'}{' '}
          <Link
            className="text-button"
            state={location.state}
            to={isSignup ? '/login' : '/signup'}
          >
            {isSignup ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  )
}
