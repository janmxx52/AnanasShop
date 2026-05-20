import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getOrderStatusLabel } from '@/lib/display-labels'
import type { DashboardOrderStatus } from '@/types/admin'

type AdminOrderStatusChartProps = {
  orderStatus: DashboardOrderStatus
}

type StatusItem = {
  key: keyof DashboardOrderStatus
  label: string
  value: number
  color: string
}

const statusColorMap: Record<keyof DashboardOrderStatus, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#6366f1',
  shipping: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#f43f5e',
  returned: '#8b5cf6',
}

function buildStatusData(orderStatus: DashboardOrderStatus): StatusItem[] {
  return (Object.keys(orderStatus) as Array<keyof DashboardOrderStatus>).map((key) => ({
    key,
    label: getOrderStatusLabel(key),
    value: Number(orderStatus[key] ?? 0),
    color: statusColorMap[key],
  }))
}

export function AdminOrderStatusChart({ orderStatus }: AdminOrderStatusChartProps) {
  const data = buildStatusData(orderStatus)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={68}
              outerRadius={105}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((item) => (
                <Cell key={item.key} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${Number(value ?? 0).toLocaleString('vi-VN')} đơn`}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Tổng đơn</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{total.toLocaleString('vi-VN')}</p>
        </div>
        {data.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-slate-700">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">{item.value.toLocaleString('vi-VN')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
