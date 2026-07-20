import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../App.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await register(form)
      toast.success('Account created.')
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create your account.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10 dark:bg-ink-950">
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-ink-400">Start a new conversation in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-panel dark:border-ink-800 dark:bg-ink-900">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium text-ink-500 dark:text-ink-300">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                value={form.firstName}
                onChange={handleChange}
                placeholder="Ada"
                className="w-full rounded-lg border border-ink-200 bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-signal dark:border-ink-700 dark:text-ink-50"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium text-ink-500 dark:text-ink-300">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                required
                value={form.lastName}
                onChange={handleChange}
                placeholder="Lovelace"
                className="w-full rounded-lg border border-ink-200 bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-signal dark:border-ink-700 dark:text-ink-50"
              />
            </div>
          </div>

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
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-ink-200 bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-signal dark:border-ink-700 dark:text-ink-50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white transition hover:bg-ink-800 disabled:opacity-60 dark:bg-signal dark:text-ink-950 dark:hover:bg-signal-soft"
          >
            {submitting ? 'Creating account…' : 'Create account'}
            {!submitting && <FiArrowRight size={15} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink-900 underline underline-offset-2 dark:text-ink-100">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
