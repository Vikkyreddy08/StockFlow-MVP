// Full-screen loading state shown while the AuthProvider restores the saved
// session. Keeps the app from flashing the wrong page before the user's
// authentication state is known.

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"
        />
        <p className="text-sm font-medium text-slate-500">Loading StockFlow…</p>
      </div>
    </div>
  )
}
