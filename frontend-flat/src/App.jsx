import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './AppRoutes.jsx'
import { fetchCurrentUser, loginRequest, logoutRequest, registerRequest } from './api/api.js'

/* ---------------------------------------------------------------
 * Theme (dark/light). Kept here rather than a separate context/
 * folder per the flat structure this project uses.
 * ------------------------------------------------------------- */

const ThemeContext = createContext(null)

function getInitialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within App')
  return ctx
}

/* ---------------------------------------------------------------
 * Auth (current user, loading, login/register/logout)
 * ------------------------------------------------------------- */

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while checking for an existing session

  // On first load, ask the backend "who am I?" using the HTTP-only
  // cookie the browser already carries. If that call fails (e.g. no
  // valid cookie), we just treat the visitor as logged out.
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const currentUser = await fetchCurrentUser()
        if (!cancelled) setUser(currentUser)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await registerRequest(payload)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within App')
  return ctx
}

/* ---------------------------------------------------------------
 * App shell
 * ------------------------------------------------------------- */

function ThemedToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: theme === 'dark' ? '#1A1B22' : '#FFFFFF',
          color: theme === 'dark' ? '#E8E9ED' : '#121218',
          border: theme === 'dark' ? '1px solid #24252F' : '1px solid #E8E9ED',
          fontSize: '0.875rem',
        },
      }}
    />
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedToaster />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
