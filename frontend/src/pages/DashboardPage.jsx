import { useCallback, useEffect, useState } from 'react'

import Alert from '../components/Alert.jsx'
import { parseApiError } from '../services/errors.js'
import { getDashboard } from '../services/dashboard.js'

const EMPTY_DASHBOARD = {
  total_products: 0,
  total_stock: 0,
  low_stock_items: [],
}

export default function DashboardPage() {
  const [data, setData] = useState(EMPTY_DASHBOARD)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getDashboard()
      setData(response)
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Inventory overview
        </h1>
      </header>

      {loading ? (
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
      ) : data.total_products === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            No products yet
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Your inventory summary will appear here once you add products.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total products"
              value={data.total_products}
              icon="📦"
            />
            <StatCard
              label="Total stock"
              value={data.total_stock}
              icon="📊"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Low stock items
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {data.low_stock_items.length} items
              </span>
            </div>

            {data.low_stock_items.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                All products are above their low-stock threshold.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.low_stock_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-600">
                        {item.quantity_on_hand} in stock
                      </p>
                      <p className="text-xs text-slate-500">
                        Threshold: {item.low_stock_threshold}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span aria-hidden="true" className="text-xl">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  )
}
