import type { ReactNode } from 'react'

type PagePlaceholderProps = {
  title: string
  description: string
  children?: ReactNode
}

export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600">{description}</p>
      {children ? <div className="pt-2">{children}</div> : null}
    </section>
  )
}
