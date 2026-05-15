import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export function RegisterPage() {
  return (
    <PagePlaceholder
      title="Register Page"
      description="Placeholder for customer registration flow."
    >
      <Link className="text-sm font-medium text-slate-900 underline" to="/auth/login">
        Already have an account? Login
      </Link>
    </PagePlaceholder>
  )
}
