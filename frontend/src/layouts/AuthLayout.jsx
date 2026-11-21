import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-800">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-3 no-underline"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            SF
          </span>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            StockFlow
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        )}
      </div>
    </div>
  )
}
