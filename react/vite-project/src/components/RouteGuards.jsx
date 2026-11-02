import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function RequireAuth({ children }) {
  const { token, loading, profileError, retryProfile } = useAuth()
  const location = useLocation()
  if (loading) return <div className="page-loading">Loading your workspace…</div>
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  if (profileError) {
    return (
      <div className="page-loading">
        <div className="profile-load-error" role="alert">
          <strong>Could not load your account</strong>
          <span>{profileError}</span>
          <button className="primary-button" onClick={retryProfile} type="button">Retry</button>
        </div>
      </div>
    )
  }
  return children
}

export function AuthRedirect() {
  const { token, loading, profileError, retryProfile } = useAuth()
  if (loading) return <div className="page-loading">Loading your workspace…</div>
  if (profileError) {
    return (
      <div className="page-loading">
        <div className="profile-load-error" role="alert">
          <strong>Could not load your account</strong>
          <span>{profileError}</span>
          <button className="primary-button" onClick={retryProfile} type="button">Retry</button>
        </div>
      </div>
    )
  }
  return <Navigate to={token ? '/projects' : '/login'} replace />
}
