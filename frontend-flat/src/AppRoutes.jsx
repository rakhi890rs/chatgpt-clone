import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import Logout from './pages/Logout.jsx'
import { useAuth } from './App.jsx'

function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-ink-50 dark:bg-ink-950">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 animate-blink rounded-full bg-signal" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-blink rounded-full bg-signal" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-blink rounded-full bg-signal" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
