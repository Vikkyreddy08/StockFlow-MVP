const VARIANTS = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-slate-200 bg-slate-50 text-slate-600',
}

export default function Alert({ variant = 'error', children }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className={`rounded-lg border px-3 py-2 text-sm ${VARIANTS[variant] ?? VARIANTS.info}`}
    >
      {children}
    </div>
  )
}
