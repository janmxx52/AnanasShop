import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardOrderChart } from '@/types/admin'

type AdminOrderChartProps = {
  chart: DashboardOrderChart
}

type ChartPoint = {
  month: string
  orders: number
}

function buildSeries(chart: DashboardOrderChart): ChartPoint[] {
  return chart.labels.map((month, index) => ({
    month,
    orders: Number(chart.series[index] ?? 0),
  }))
}

export function AdminOrderChart({ chart }: AdminOrderChartProps) {
  const data = buildSeries(chart)

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} đơn`, 'Số đơn']}
            labelFormatter={(label) => `Tháng: ${label}`}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            }}
          />
          <Bar dataKey="orders" fill="#0f766e" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
