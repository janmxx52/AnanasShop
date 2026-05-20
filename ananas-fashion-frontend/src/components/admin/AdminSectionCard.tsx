import type { ReactNode } from 'react'

type AdminSectionCardProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function AdminSectionCard({
  title,
  description,
  actions,
  className = '',
  bodyClassName = '',
  children,
}: AdminSectionCardProps) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? <p className="text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

