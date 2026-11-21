import api from './api'

// Product API calls. The endpoint is organization-scoped on the server and
// requires a valid access token, which the Axios request interceptor attaches
// automatically.

export function getProducts() {
  // GET /api/products/ returns a plain JSON array of products for the
  // authenticated user's organization.
  return api.get('/products/').then((response) => response.data)
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
