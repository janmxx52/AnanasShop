import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  isLoading?: boolean
  children: ReactNode
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-[#f15a24] text-white hover:bg-[#d94f1e]',
  secondary: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium leading-5 whitespace-nowrap transition ${variantClassNames[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  )
}
