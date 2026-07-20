import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../App.jsx'

export default function Logout() {
  const { logout } = useAuth()
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    logout()
      .then(() => toast.success('Signed out.'))
      .catch(() => toast.error('Signed out locally, but the server call failed.'))
  }, [logout])

  return <Navigate to="/login" replace />
}
