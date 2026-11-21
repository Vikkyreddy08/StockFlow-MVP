import { useCallback, useEffect, useState } from 'react'

import Alert from '../components/Alert.jsx'
import TextField from '../components/TextField.jsx'
import { parseApiError } from '../services/errors.js'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/products.js'

// Low-stock rule mirrors the backend dashboard logic: a product is low stock
// only when it has a threshold and its quantity is at or below that threshold.
// Products without a threshold are never reported as low stock.
function isLowStock(product) {
  return (
    product.low_stock_threshold !== null &&
    product.low_stock_threshold !== undefined &&
    product.quantity_on_hand <= product.low_stock_threshold
  )
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  const amount = Number(value)
  return Number.isNaN(amount) ? '—' : amount.toFixed(2)
}

const INITIAL_FORM = {
  name: '',
  sku: '',
  description: '',
  quantity_on_hand: '',
  cost_price: '',
  selling_price: '',
  low_stock_threshold: '',
}

// Quantity and threshold are PositiveIntegerField on the backend.
const WHOLE_NUMBER_PATTERN = /^\d+$/
// Prices are DecimalField(max_digits=12, decimal_places=2).
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

function toFormValues(product) {
  const asText = (value) =>
    value === null || value === undefined ? '' : String(value)

  return {
    name: product.name ?? '',
    sku: product.sku ?? '',
    description: product.description ?? '',
    quantity_on_hand: asText(product.quantity_on_hand),
    cost_price: asText(product.cost_price),
    selling_price: asText(product.selling_price),
    low_stock_threshold: asText(product.low_stock_threshold),
  }
}

function buildPayload(form, isEdit) {
  const payload = {
    name: form.name.trim(),
    sku: form.sku.trim(),
    quantity_on_hand: Number(form.quantity_on_hand),
  }

  const description = form.description.trim()
  if (description || isEdit) payload.description = description

  const costPrice = form.cost_price.trim()
  const sellingPrice = form.selling_price.trim()
  const threshold = form.low_stock_threshold.trim()

  if (isEdit) {
    // On edit, clearing an optional field removes the stored value (null).
    payload.cost_price = costPrice || null
    payload.selling_price = sellingPrice || null
    payload.low_stock_threshold = threshold ? Number(threshold) : null
  } else {
    if (costPrice) payload.cost_price = costPrice
    if (sellingPrice) payload.selling_price = sellingPrice
    if (threshold) payload.low_stock_threshold = Number(threshold)
  }

  return payload
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionError, setActionError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getProducts()
      setProducts(response)
    } catch (err) {
      const { message } = parseApiError(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isFormOpen = showForm || editingProduct !== null

  const handleAddClick = () => {
    setSuccess('')
    setActionError('')
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditClick = (product) => {
    setSuccess('')
    setActionError('')
    setShowForm(false)
    setEditingProduct(product)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleSaved = (message) => {
    setShowForm(false)
    setEditingProduct(null)
    setSuccess(message)
    load()
  }

  const handleDelete = async (product) => {
    if (deletingId !== null) return
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    )
    if (!confirmed) return

    setSuccess('')
    setActionError('')
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setSuccess(`Deleted "${product.name}".`)
      await load()
    } catch (err) {
      const { message } = parseApiError(err)
      setActionError(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Inventory
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Products
          </h1>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={handleAddClick}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            Add product
          </button>
        )}
      </header>

      {success && !isFormOpen && <Alert variant="success">{success}</Alert>}
      {actionError && !isFormOpen && (
        <Alert variant="error">{actionError}</Alert>
      )}

      {isFormOpen ? (
        <ProductForm
          key={editingProduct ? `edit-${editingProduct.id}` : 'create'}
          product={editingProduct}
          onCancel={handleCancel}
          onSaved={handleSaved}
        />
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
          <span
            aria-hidden="true"
            className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"
          />
        </div>
      ) : error ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8">
          <Alert variant="error">{error}</Alert>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-sm font-medium text-slate-500">No products yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Products added to your organization will appear here.
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              All products
            </h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Product name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Selling price
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Low stock status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{product.sku}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-700">
                      {product.quantity_on_hand}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-700">
                      {formatPrice(product.selling_price)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge low={isLowStock(product)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(product)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === product.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function ProductForm({ product, onCancel, onSaved }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(() =>
    product ? toFormValues(product) : INITIAL_FORM,
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const validate = () => {
    const errors = {}

    if (!form.name.trim()) {
      errors.name = 'Product name is required.'
    }
    if (!form.sku.trim()) {
      errors.sku = 'SKU is required.'
    }

    const quantity = form.quantity_on_hand.trim()
    if (!quantity) {
      errors.quantity_on_hand = 'Quantity on hand is required.'
    } else if (!WHOLE_NUMBER_PATTERN.test(quantity)) {
      errors.quantity_on_hand = 'Enter a whole number of 0 or more.'
    }

    const costPrice = form.cost_price.trim()
    if (costPrice && !PRICE_PATTERN.test(costPrice)) {
      errors.cost_price = 'Enter a valid price with up to 2 decimals.'
    }

    const sellingPrice = form.selling_price.trim()
    if (sellingPrice && !PRICE_PATTERN.test(sellingPrice)) {
      errors.selling_price = 'Enter a valid price with up to 2 decimals.'
    }

    const threshold = form.low_stock_threshold.trim()
    if (threshold && !WHOLE_NUMBER_PATTERN.test(threshold)) {
      errors.low_stock_threshold = 'Enter a whole number of 0 or more.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateProduct(product.id, buildPayload(form, true))
        onSaved('Product updated successfully.')
      } else {
        await createProduct(buildPayload(form, false))
        onSaved('Product created successfully.')
      }
    } catch (error) {
      const { message, fieldErrors: apiFieldErrors } = parseApiError(error)
      setFormError(message)
      setFieldErrors((previous) => ({ ...previous, ...apiFieldErrors }))
    } finally {
      setSubmitting(false)
    }
  }

  const submitLabel = submitting
    ? isEdit
      ? 'Saving...'
      : 'Creating...'
    : isEdit
      ? 'Save changes'
      : 'Create product'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          {isEdit ? 'Edit product' : 'New product'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit
            ? 'Update this product\u2019s details.'
            : 'Add a product to your organization&apos;s inventory.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="name"
            label="Product name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="Widget"
            required
          />
          <TextField
            id="sku"
            label="SKU"
            value={form.sku}
            onChange={handleChange}
            error={fieldErrors.sku}
            placeholder="SKU-001"
            required
          />
        </div>

        <TextField
          id="description"
          label="Description"
          value={form.description}
          onChange={handleChange}
          error={fieldErrors.description}
          placeholder="Optional notes about this product"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="quantity_on_hand"
            label="Quantity on hand"
            type="number"
            value={form.quantity_on_hand}
            onChange={handleChange}
            error={fieldErrors.quantity_on_hand}
            placeholder="0"
            required
          />
          <TextField
            id="low_stock_threshold"
            label="Low stock threshold"
            type="number"
            value={form.low_stock_threshold}
            onChange={handleChange}
            error={fieldErrors.low_stock_threshold}
            placeholder="Optional"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="cost_price"
            label="Cost price"
            type="number"
            value={form.cost_price}
            onChange={handleChange}
            error={fieldErrors.cost_price}
            placeholder="Optional"
          />
          <TextField
            id="selling_price"
            label="Selling price"
            type="number"
            value={form.selling_price}
            onChange={handleChange}
            error={fieldErrors.selling_price}
            placeholder="Optional"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  )
}

function StatusBadge({ low }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        low ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600',
      ].join(' ')}
    >
      {low ? 'Low stock' : 'OK'}
    </span>
  )
}
