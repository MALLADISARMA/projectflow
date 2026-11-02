const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5454').replace(/\/+$/, '')

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new Error(
      `Could not connect to the backend at ${API_BASE_URL}. Check that the backend is running.`,
    )
  }

  if (!response.ok) {
    const responseText = await response.text()
    let message = responseText || `Request failed (${response.status}).`
    try {
      const details = JSON.parse(responseText)
      message = details.message || details.error || message
    } catch {
      // Keep the server's plain-text response as the visible error.
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  const responseText = await response.text()
  return responseText ? JSON.parse(responseText) : null
}
