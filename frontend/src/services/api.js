import axios from 'axios'

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

export default api
