import type { ReactNode } from 'react'

type AdminTableProps = {
  minWidthClassName?: string
  children: ReactNode
}

export function AdminTable({ minWidthClassName = 'min-w-[960px]', children }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className={`${minWidthClassName} w-full bg-white text-sm`}>{children}</table>
    </div>
  )
}
