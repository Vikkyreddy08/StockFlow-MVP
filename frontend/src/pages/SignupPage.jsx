import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Alert from '../components/Alert.jsx'
import TextField from '../components/TextField.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { register } from '../services/auth.js'
import { parseApiError } from '../services/errors.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_FORM = {
  organization_name: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const validate = () => {
    const errors = {}

    if (!form.organization_name.trim()) {
      errors.organization_name = 'Organization name is required.'
    }

    const email = form.email.trim()
    if (!email) {
      errors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }

    if (!form.confirm_password) {
      errors.confirm_password = 'Please confirm your password.'
    } else if (form.password !== form.confirm_password) {
      errors.confirm_password = 'Passwords do not match.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await register({
        organization_name: form.organization_name.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirm_password: form.confirm_password,
      })
      navigate('/login', {
        state: { notice: 'Account created successfully. Please sign in.' },
      })
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
      title="Create your account"
      subtitle="Set up your organization and start managing inventory."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <Alert variant="error">{formError}</Alert>}

        <TextField
          id="organization_name"
          label="Organization name"
          value={form.organization_name}
          onChange={handleChange}
          error={fieldErrors.organization_name}
          autoComplete="organization"
          placeholder="Acme Corp"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="first_name"
            label="First name"
            value={form.first_name}
            onChange={handleChange}
            error={fieldErrors.first_name}
            autoComplete="given-name"
          />
          <TextField
            id="last_name"
            label="Last name"
            value={form.last_name}
            onChange={handleChange}
            error={fieldErrors.last_name}
            autoComplete="family-name"
          />
        </div>

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
          autoComplete="new-password"
          required
        />
        <TextField
          id="confirm_password"
          label="Confirm password"
          type="password"
          value={form.confirm_password}
          onChange={handleChange}
          error={fieldErrors.confirm_password}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
