import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to home
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">Authentication</h1>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
