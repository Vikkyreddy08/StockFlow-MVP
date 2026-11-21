import { NavLink } from 'react-router-dom'

const upcomingItems = [
  { label: 'Dashboard', hint: 'Step 9' },
  { label: 'Products', hint: 'Step 10' },
  { label: 'Settings', hint: 'Later' },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
          SF
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          StockFlow
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            [
              'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')
          }
        >
          Home
        </NavLink>

        {upcomingItems.map((item) => (
          <div
            key={item.label}
            className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-400"
            aria-disabled="true"
          >
            <span>{item.label}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {item.hint}
            </span>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-400">
        v0.1.0 · Frontend setup
      </div>
    </aside>
  )
}
