import api from './api'

// Auth API calls live here so components never talk to Axios directly.
// Endpoints match the Django routes mounted at /api/auth/.

export function register(payload) {
  return api.post('/auth/register/', payload).then((response) => response.data)
}

export function login(payload) {
  return api.post('/auth/login/', payload).then((response) => response.data)
}
