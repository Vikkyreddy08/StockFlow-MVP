import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.js'

export default function Header() {
  const { user, isAuthenticated, loading, logout } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
          SF
        </span>
        <span className="font-semibold text-slate-900">StockFlow</span>
      </div>

      <div className="hidden text-sm font-medium text-slate-500 lg:block">
        Inventory management workspace
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 sm:inline">
          Preview
        </span>

        {loading ? (
          <span
            aria-hidden="true"
            className="h-8 w-20 animate-pulse rounded-lg bg-slate-100"
          />
        ) : isAuthenticated ? (
          <>
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
