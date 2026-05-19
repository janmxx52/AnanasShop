import type { ReactNode } from 'react'

type AdminToolbarProps = {
  children: ReactNode
  className?: string
}

export function AdminToolbar({ children, className = '' }: AdminToolbarProps) {
  return (
    <div className={`flex flex-wrap items-end gap-3 border border-neutral-200 bg-neutral-50 p-3 ${className}`}>
      {children}
    </div>
  )
}
