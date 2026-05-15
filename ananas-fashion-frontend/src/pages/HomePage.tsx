import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export function HomePage() {
  return (
    <PagePlaceholder
      title="Home Page"
      description="Frontend scaffold is ready. Next step is wiring each feature page to API modules and UI components."
    >
      <div className="flex flex-wrap gap-2">
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/products">
          Browse products
        </Link>
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/cart">
          Open cart
        </Link>
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/admin/dashboard">
          Admin dashboard
        </Link>
      </div>
    </PagePlaceholder>
  )
}
