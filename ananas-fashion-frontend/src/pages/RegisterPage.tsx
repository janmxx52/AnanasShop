import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { formatFieldError, getApiErrorInfo } from '@/lib/api-helpers'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    setFieldErrors(null)

    try {
      await register({
        name,
        email,
        phone: phone || undefined,
        password,
        password_confirmation: passwordConfirmation,
        device_name: 'web',
      })

      navigate('/', { replace: true })
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setFormError(apiError.message)
      setFieldErrors(apiError.errors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Register</h2>
        <p className="text-sm text-slate-600">Create a customer account to continue.</p>
      </div>

      {formError ? <ErrorState message={formError} /> : null}

      <Input
        label="Name"
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={formatFieldError(fieldErrors, 'name')}
        required
      />

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
        label="Phone"
        name="phone"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={formatFieldError(fieldErrors, 'phone')}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={formatFieldError(fieldErrors, 'password')}
        required
      />

      <Input
        label="Confirm password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        value={passwordConfirmation}
        onChange={(event) => setPasswordConfirmation(event.target.value)}
        error={formatFieldError(fieldErrors, 'password_confirmation')}
        required
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Register
      </Button>

      <p className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-medium text-slate-900 underline" to="/login">
          Login
        </Link>
      </p>
    </form>
  )
}
