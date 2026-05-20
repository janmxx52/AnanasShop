import type { ReactNode } from 'react'

type MetricTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

type AdminMetricCardProps = {
  label: string
  value: ReactNode
  helper?: string
  icon?: ReactNode
  tone?: MetricTone
  growth?: number | null
  growthLabel?: string
}

const toneClassMap: Record<MetricTone, string> = {
  neutral: 'border-slate-200 bg-white text-slate-900',
  primary: 'border-blue-100 bg-blue-50/80 text-blue-900',
  success: 'border-emerald-100 bg-emerald-50/80 text-emerald-900',
  warning: 'border-amber-100 bg-amber-50/80 text-amber-900',
  danger: 'border-rose-100 bg-rose-50/80 text-rose-900',
}

const iconToneClassMap: Record<MetricTone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
}

function formatGrowth(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

function getGrowthTone(value: number): string {
  if (value > 0) {
    return 'text-emerald-700 bg-emerald-100'
  }

  if (value < 0) {
    return 'text-rose-700 bg-rose-100'
  }

  return 'text-slate-700 bg-slate-100'
}

export function AdminMetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'neutral',
  growth = null,
  growthLabel,
}: AdminMetricCardProps) {
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${toneClassMap[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        {icon ? (
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-base ${iconToneClassMap[tone]}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-2xl font-bold leading-none">{value}</div>
      {growth !== null ? (
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${getGrowthTone(growth)}`}>
            {formatGrowth(growth)}
          </span>
          {growthLabel ? <span className="text-xs text-slate-500">{growthLabel}</span> : null}
        </div>
      ) : null}
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </article>
  )
}
