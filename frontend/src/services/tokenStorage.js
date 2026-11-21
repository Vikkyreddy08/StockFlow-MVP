// Single source of truth for the JWT session persisted in the browser.
//
// Storage strategy: localStorage (the trade-offs are documented in
// AuthProvider). Only tokens are ever stored here - never passwords or
// credentials - and nothing is written to the console.

const ACCESS_TOKEN_KEY = 'stockflow.access_token'
const REFRESH_TOKEN_KEY = 'stockflow.refresh_token'

const listeners = new Set()

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setSession({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  notify()
}

export function setAccessToken(access) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
  notify()
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  notify()
}
