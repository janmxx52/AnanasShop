import { Link } from 'react-router-dom'

export type BreadcrumbItem = {
  label: string
  to?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-neutral-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="transition hover:text-[#f15a24]">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-medium text-neutral-900' : ''}>{item.label}</span>
              )}
              {!isLast ? <span className="text-neutral-400">/</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
