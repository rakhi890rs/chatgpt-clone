import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../App.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(form)
      toast.success('Welcome back.')
      const redirectTo = location.state?.from || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-ink-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 dark:bg-signal">
            <span className="font-display text-lg font-bold text-white dark:text-ink-950">N</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-ink-400">Sign in to pick up your conversations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-panel dark:border-ink-800 dark:bg-ink-900">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-500 dark:text-ink-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-ink-200 bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-signal dark:border-ink-700 dark:text-ink-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink-500 dark:text-ink-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ink-200 bg-transparent px-3 py-2.5 pr-10 text-sm text-ink-900 outline-none transition focus:border-signal dark:border-ink-700 dark:text-ink-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white transition hover:bg-ink-800 disabled:opacity-60 dark:bg-signal dark:text-ink-950 dark:hover:bg-signal-soft"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
            {!submitting && <FiArrowRight size={15} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-ink-900 underline underline-offset-2 dark:text-ink-100">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
