type ProgressTone = 'primary' | 'success' | 'warning' | 'danger'

type AdminMiniProgressProps = {
  label: string
  value: number
  total: number
  tone?: ProgressTone
}

const barToneClassMap: Record<ProgressTone, string> = {
  primary: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
}

export function AdminMiniProgress({ label, value, total, tone = 'primary' }: AdminMiniProgressProps) {
  const safeTotal = total > 0 ? total : 0
  const percent = safeTotal === 0 ? 0 : Math.min(100, Math.round((value / safeTotal) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-medium text-slate-700">{label}</p>
        <p className="text-slate-500">
          <span className="font-semibold text-slate-900">{value.toLocaleString('vi-VN')}</span> ({percent}%)
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${barToneClassMap[tone]}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

