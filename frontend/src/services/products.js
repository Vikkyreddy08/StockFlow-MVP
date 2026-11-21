import api from './api'

// Product API calls. The endpoint is organization-scoped on the server and
// requires a valid access token, which the Axios request interceptor attaches
// automatically.

export function getProducts(search = '') {
  // GET /api/products/ returns a plain JSON array of products for the
  // authenticated user's organization. An optional `search` term is sent as a
  // query parameter for case-insensitive name/SKU filtering on the server.
  const trimmed = search.trim()
  const config = trimmed ? { params: { search: trimmed } } : undefined
  return api.get('/products/', config).then((response) => response.data)
}

export function createProduct(payload) {
  // POST /api/products/ creates a product for the authenticated user's
  // organization. The server assigns `organization`, so it is never sent here.
  return api.post('/products/', payload).then((response) => response.data)
}

export function updateProduct(id, payload) {
  // PATCH /api/products/<id>/ partially updates a product. Only the supplied
  // fields are changed and `organization` is never sent.
  return api.patch(`/products/${id}/`, payload).then((response) => response.data)
}

export function deleteProduct(id) {
  // DELETE /api/products/<id>/ removes a product from the organization.
  return api.delete(`/products/${id}/`).then((response) => response.data)
}
