import api from './api'

// Dashboard API call. The endpoint is organization-scoped on the server and
// requires a valid access token, which the Axios request interceptor attaches
// automatically.

export function getDashboard() {
  return api.get('/dashboard/').then((response) => response.data)
}
