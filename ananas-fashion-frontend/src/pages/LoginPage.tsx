import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { useToast } from '@/app/ToastContext'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { formatFieldError, parseApiError } from '@/lib/api-helpers'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const redirectPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    setFieldErrors(null)

    try {
      await login({
        email,
        password,
        device_name: 'web',
      })

      toast.success('Đăng nhập thành công.')
      navigate(redirectPath, { replace: true })
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
      setFormError(apiError.message)
      setFieldErrors(apiError.errors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Đăng nhập</h2>
        <p className="text-sm text-slate-600">Sử dụng thông tin tài khoản để tiếp tục.</p>
      </div>

      {formError ? <ErrorState message={formError} /> : null}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={formatFieldError(fieldErrors, 'email')}
        required
      />

      <Input
        label="Mật khẩu"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={formatFieldError(fieldErrors, 'password')}
        required
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Đăng nhập
      </Button>

      <p className="text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link className="font-medium text-slate-900 underline" to="/register">
          Đăng ký
        </Link>
      </p>
    </form>
  )
}
