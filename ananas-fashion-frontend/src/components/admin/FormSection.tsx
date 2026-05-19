import type { ReactNode } from 'react'

type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <section className={`space-y-3 rounded border border-neutral-200 bg-neutral-50 p-3 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {description ? <p className="text-xs text-neutral-600">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
