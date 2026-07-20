import axios from 'axios'

// Single axios instance shared by every call in this app.
// withCredentials is required so the browser sends/receives the
// HTTP-only auth cookie set by the backend. Never store the JWT
// in localStorage/sessionStorage — the cookie is the only source
// of truth for auth state on the client.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Documented endpoints, used exactly as specified:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   GET  /api/auth/me      (added to the backend during review)
 *   POST /api/auth/logout  (added to the backend during review)
 */

export async function registerRequest({ firstName, lastName, email, password }) {
  const { data } = await api.post('/api/auth/register', {
    fullname: { firstName, lastName },
    email,
    password,
  })
  return data
}

export async function loginRequest({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/api/auth/me')
  return data.user
}

export async function logoutRequest() {
  const { data } = await api.post('/api/auth/logout')
  return data
}
