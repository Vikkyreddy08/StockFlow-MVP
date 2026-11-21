import api from './api'

// Auth API calls live here so components never talk to Axios directly.
// Endpoints match the Django routes mounted at /api/auth/.

export function register(payload) {
  // Public endpoint: `skipAuth` stops the interceptors from sending a bearer
  // token or reacting to a 401 with a token refresh.
  return api
    .post('/auth/register/', payload, { skipAuth: true })
    .then((response) => response.data)
}

export function login(payload) {
  return api
    .post('/auth/login/', payload, { skipAuth: true })
    .then((response) => response.data)
}

export function getMe() {
  return api.get('/auth/me/').then((response) => response.data)
}
