import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export function NotFoundPage() {
  return (
    <PagePlaceholder title="404 - Not Found" description="The route does not exist in this scaffold.">
      <Link className="text-sm font-medium text-slate-900 underline" to="/">
        Back to home
      </Link>
    </PagePlaceholder>
  )
}
