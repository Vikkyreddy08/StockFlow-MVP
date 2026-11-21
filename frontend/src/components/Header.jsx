export default function Header() {
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

      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        Preview
      </span>
    </header>
  )
}
