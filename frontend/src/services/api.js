import axios from 'axios'

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from './tokenStorage'

// Centralized API configuration. The base URL comes from the
// VITE_API_BASE_URL environment variable and falls back to the
// local Django development server. Never place secrets here.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the current access token to outgoing requests. Requests flagged with
// `skipAuth` (login, register) never send a bearer token.
api.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const access = getAccessToken()
    if (access) {
      config.headers.Authorization = `Bearer ${access}`
    }
  }
  return config
})

// A single in-flight refresh shared by every caller, so a burst of 401s
// results in exactly one POST /api/auth/token/refresh/.
let refreshRequest = null

function requestNewAccessToken() {
  if (!refreshRequest) {
    refreshRequest = axios
      .post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: getRefreshToken(),
      })
      .then((response) => {
        const access = response.data?.access
        if (!access) {
          throw new Error('Refresh response did not include an access token.')
        }
        setAccessToken(access)
        return access
      })
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const status = response?.status

    // Retry only genuine access-token failures, and only once. Login and
    // register requests are excluded so a failed login never triggers a
    // refresh attempt.
    if (status !== 401 || !config || config._retry || config.skipAuth) {
      throw error
    }

    if (!getRefreshToken()) {
      clearSession()
      throw error
    }

    config._retry = true
    try {
      const access = await requestNewAccessToken()
      config.headers = { ...config.headers, Authorization: `Bearer ${access}` }
      return api(config)
    } catch (refreshError) {
      clearSession()
      throw refreshError
    }
  },
)

export default api
