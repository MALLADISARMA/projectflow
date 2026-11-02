import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { AuthContext } from './auth-context.js'

const TOKEN_KEY = 'projectflow-token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))
  const [profileError, setProfileError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!token) return undefined

    let active = true
    apiRequest('/api/users/profile', { token })
      .then((profile) => {
        if (!active) return
        setUser(profile)
        setProfileError('')
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 401) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        } else {
          setProfileError(error.message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [retryKey, token])

  const authenticate = async (mode, credentials) => {
    const response = await apiRequest(mode === 'signup' ? '/auth/signup' : '/auth/signing', {
      method: 'POST',
      body: credentials,
    })
    if (!response?.jwt) throw new Error('The server did not return an authentication token.')
    localStorage.setItem(TOKEN_KEY, response.jwt)
    setProfileError('')
    setLoading(true)
    setToken(response.jwt)
    return response
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setLoading(false)
    setProfileError('')
  }

  const retryProfile = () => {
    setProfileError('')
    setLoading(true)
    setRetryKey((current) => current + 1)
  }

  const value = useMemo(
    () => ({ token, user, loading, profileError, authenticate, signOut, retryProfile }),
    [token, user, loading, profileError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
