import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import Alert from '../components/Alert.jsx'
import TextField from '../components/TextField.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { login } from '../services/auth.js'
import { parseApiError } from '../services/errors.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice ?? '')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const validate = () => {
    const errors = {}
    const email = form.email.trim()
    if (!email) {
      errors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.'
    }
    if (!form.password) {
      errors.password = 'Password is required.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    setNotice('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      setSuccess(
        'Signed in successfully. The dashboard will be wired up in the next step.',
      )
      setForm((previous) => ({ ...previous, password: '' }))
    } catch (error) {
      const { message, fieldErrors: apiFieldErrors } = parseApiError(error)
      setFormError(message)
      setFieldErrors((previous) => ({ ...previous, ...apiFieldErrors }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your StockFlow workspace."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {notice && <Alert variant="success">{notice}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {formError && <Alert variant="error">{formError}</Alert>}

        <TextField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
