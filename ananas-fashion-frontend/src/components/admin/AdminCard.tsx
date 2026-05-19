import type { ReactNode } from 'react'

type AdminCardProps = {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function AdminCard({
  title,
  description,
  actions,
  children,
  className = '',
  bodyClassName = '',
}: AdminCardProps) {
  return (
    <section className={`overflow-hidden border border-neutral-200 bg-white ${className}`}>
      {title || description || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          <div className="space-y-1">
            {title ? <h2 className="text-base font-semibold text-neutral-900">{title}</h2> : null}
            {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
