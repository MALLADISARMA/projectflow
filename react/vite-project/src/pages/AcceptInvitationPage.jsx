import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, LoaderCircle, Mail } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../lib/api.js'

export default function AcceptInvitationPage() {
  const { token, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('token')
  const [state, setState] = useState(() => ({
    loading: false,
    error: invitationToken ? '' : 'This invitation link is missing its token.',
    accepted: false,
  }))
  const [retryKey, setRetryKey] = useState(0)
  const acceptanceRequest = useRef(null)
  const returnTo = {
    pathname: '/accept_invitation',
    search: invitationToken ? `?token=${encodeURIComponent(invitationToken)}` : '',
  }
  const authState = { from: returnTo }

  useEffect(() => {
    if (!invitationToken || !token) return undefined

    const attemptKey = `${invitationToken}:${token}:${retryKey}`
    let active = true

    if (acceptanceRequest.current?.key !== attemptKey) {
      acceptanceRequest.current = {
        key: attemptKey,
        promise: apiRequest(
          `/api/projects/accept_invite?token=${encodeURIComponent(invitationToken)}`,
          { method: 'POST', token },
        ),
      }
    }

    acceptanceRequest.current.promise
      .then(() => {
        if (active) setState({ loading: false, error: '', accepted: true })
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message, accepted: false })
      })

    return () => {
      active = false
    }
  }, [invitationToken, retryKey, token])

  return (
    <main className="page-content invitation-page">
      <section className="content-panel invitation-card">
        {!invitationToken ? (
          <>
            <div className="empty-state-icon">!</div>
            <h1>Invitation link is incomplete</h1>
            <p className="page-description">Ask the project owner to send you a new invitation link.</p>
            <Link className="secondary-button" to="/login">Go to sign in</Link>
          </>
        ) : token && (state.loading || (!state.error && !state.accepted)) ? (
          <>
            <LoaderCircle className="spin invitation-icon" size={28} />
            <h1>Accepting your invitation…</h1>
            <p className="page-description">Adding your account to the project workspace.</p>
          </>
        ) : state.accepted ? (
          <>
            <CheckCircle2 className="success-icon" size={34} />
            <h1>You’re in!</h1>
            <p className="page-description">The project has been added to your workspace.</p>
            <Link className="primary-button" to="/projects">Go to projects</Link>
          </>
        ) : !token ? (
          <>
            <span className="invitation-mail-icon"><Mail size={21} /></span>
            <p className="eyebrow">Project invitation</p>
            <h1>You’ve been invited to collaborate</h1>
            <p className="page-description">
              {state.error
                ? 'Your account could not be verified yet. Sign in or create an account with the email address this invitation was sent to.'
                : 'You can accept this invitation with an existing account or create a new account. Use the email address this invitation was sent to.'}
            </p>
            <div className="invitation-actions">
              <Link className="primary-button" state={authState} to="/login">Sign in to accept</Link>
              <Link className="secondary-button" state={authState} to="/signup">Create an account</Link>
            </div>
            {state.error && <p className="error-message" role="alert">{state.error}</p>}
          </>
        ) : (
          <>
            <div className="empty-state-icon">!</div>
            <h1>Invitation could not be accepted</h1>
            <p className="error-message" role="alert">{state.error}</p>
            <p className="page-description">
              Make sure you are signed in with the same email address that received this invitation.
            </p>
            <button
              className="primary-button"
              onClick={() => {
                setState({ loading: true, error: '', accepted: false })
                setRetryKey((current) => current + 1)
              }}
              type="button"
            >
              Try again
            </button>
            <button
              className="text-button"
              onClick={() => {
                signOut()
                navigate('/login', { state: authState })
              }}
              type="button"
            >
              Switch account
            </button>
          </>
        )}
      </section>
    </main>
  )
}
