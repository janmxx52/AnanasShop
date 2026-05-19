type AdminStatusTone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

type AdminStatusPillProps = {
  label: string
  tone?: AdminStatusTone
}

const toneClassMap: Record<AdminStatusTone, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-rose-100 text-rose-800',
  warning: 'bg-amber-100 text-amber-800',
  neutral: 'bg-neutral-100 text-neutral-700',
  info: 'bg-sky-100 text-sky-800',
}

export function AdminStatusPill({ label, tone = 'neutral' }: AdminStatusPillProps) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${toneClassMap[tone]}`}>{label}</span>
}
