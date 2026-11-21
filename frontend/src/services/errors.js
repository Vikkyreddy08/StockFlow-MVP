// Normalizes DRF / Axios errors into a predictable shape so forms can show
// a top-level message plus per-field messages.
//
// Returns: { message: string, fieldErrors: Record<string, string> }

export function parseApiError(error) {
  const fieldErrors = {}
  const response = error?.response

  if (!response) {
    return {
      message: 'Unable to reach the server. Please check your connection and try again.',
      fieldErrors,
    }
  }

  if (response.status === 401) {
    return { message: 'Invalid email or password.', fieldErrors }
  }

  const data = response.data
  let message = 'Something went wrong. Please try again.'

  if (typeof data === 'string' && data.trim()) {
    return { message: data, fieldErrors }
  }

  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string') {
      message = data.detail
    }

    let hasFieldError = false
    for (const [key, value] of Object.entries(data)) {
      if (key === 'detail') continue
      const text = Array.isArray(value) ? value.join(' ') : String(value)
      if (key === 'non_field_errors') {
        message = text
        continue
      }
      fieldErrors[key] = text
      hasFieldError = true
    }

    if (hasFieldError && !data.detail && !data.non_field_errors) {
      message = 'Please correct the highlighted fields.'
    }
  }

  return { message, fieldErrors }
}
