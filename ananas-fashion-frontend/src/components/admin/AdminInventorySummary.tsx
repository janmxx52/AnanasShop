import type { DashboardInventory } from '@/types/admin'

type AdminInventorySummaryProps = {
  inventory: DashboardInventory
}

type InventoryRow = {
  label: string
  value: number
  tone: 'success' | 'warning' | 'danger'
}

const toneClassMap: Record<InventoryRow['tone'], { chip: string; bar: string }> = {
  success: {
    chip: 'bg-emerald-100 text-emerald-800',
    bar: 'bg-emerald-500',
  },
  warning: {
    chip: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-500',
  },
  danger: {
    chip: 'bg-rose-100 text-rose-800',
    bar: 'bg-rose-500',
  },
}

export function AdminInventorySummary({ inventory }: AdminInventorySummaryProps) {
  const rows: InventoryRow[] = [
    { label: 'Còn hàng', value: inventory.in_stock, tone: 'success' },
    { label: 'Sắp hết hàng', value: inventory.low_stock, tone: 'warning' },
    { label: 'Hết hàng', value: inventory.out_of_stock, tone: 'danger' },
  ]

  const total = rows.reduce((sum, row) => sum + row.value, 0)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Tổng biến thể</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{total.toLocaleString('vi-VN')}</p>
      </div>

      {rows.map((row) => {
        const percent = total > 0 ? Math.round((row.value / total) * 100) : 0

        return (
          <div key={row.label} className="rounded-xl border border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">{row.label}</span>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${toneClassMap[row.tone].chip}`}>
                {row.value.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${toneClassMap[row.tone].bar}`} style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{percent}% tổng biến thể</p>
          </div>
        )
      })}
    </div>
  )
}
