import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export function LoginPage() {
  return (
    <PagePlaceholder
      title="Login Page"
      description="Placeholder for Sanctum token login flow. Token will be stored in localStorage and used in Authorization Bearer header."
    >
      <Link className="text-sm font-medium text-slate-900 underline" to="/auth/register">
        Need an account? Register
      </Link>
    </PagePlaceholder>
  )
}
