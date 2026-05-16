import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '@/api/admin.api'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import type { DashboardStats } from '@/types/admin'

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  )
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await adminApi.dashboardStats()
      setStats(response)
    } catch (error) {
      const apiError = parseApiError(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  const metricCards = useMemo(() => {
    if (!stats) {
      return []
    }

    return [
      { label: 'Tổng người dùng', value: stats.total_users.toLocaleString('vi-VN') },
      { label: 'Tổng sản phẩm', value: stats.total_products.toLocaleString('vi-VN') },
      { label: 'Tổng đơn hàng', value: stats.total_orders.toLocaleString('vi-VN') },
      { label: 'Tổng doanh thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.total_revenue) },
      { label: 'Đơn chờ xác nhận', value: stats.pending_orders.toLocaleString('vi-VN') },
      { label: 'Đơn đã hủy', value: stats.cancelled_orders.toLocaleString('vi-VN') },
      { label: 'Đơn đã giao', value: stats.delivered_orders.toLocaleString('vi-VN') },
      { label: 'Biến thể sắp hết hàng', value: stats.low_stock_variants.toLocaleString('vi-VN') },
      { label: 'Biến thể hết hàng', value: stats.out_of_stock_variants.toLocaleString('vi-VN') },
      { label: 'Tổng đánh giá', value: stats.total_reviews.toLocaleString('vi-VN') },
      { label: 'Điểm đánh giá trung bình', value: stats.average_rating.toFixed(1) },
    ]
  }, [stats])

  if (isLoading) {
    return <LoadingState message="Đang tải thống kê dashboard..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (!stats) {
    return <EmptyState title="Chưa có dữ liệu dashboard" />
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard quản trị</h1>
          <p className="text-sm text-slate-600">Tổng quan nhanh tình trạng hệ thống theo dữ liệu API.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void fetchStats()}>
          Tải lại
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} label={card.label} value={card.value} />
        ))}
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Đơn hàng gần đây</h2>
        {stats.recent_orders.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng gần đây" />
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-[760px] bg-white text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2">Mã đơn</th>
                  <th className="px-3 py-2">Khách hàng</th>
                  <th className="px-3 py-2">Trạng thái đơn</th>
                  <th className="px-3 py-2">Trạng thái thanh toán</th>
                  <th className="px-3 py-2">Tổng tiền</th>
                  <th className="px-3 py-2">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => (
                  <tr key={order.order_code} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{order.order_code}</td>
                    <td className="px-3 py-2 text-slate-700">{order.customer_name || 'N/A'}</td>
                    <td className="px-3 py-2">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-2">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-3 py-2 text-slate-900">
                      <PriceText value={order.total} />
                    </td>
                    <td className="px-3 py-2 text-slate-700">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Sản phẩm bán chạy</h2>
        {stats.top_selling_products.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu sản phẩm bán chạy" />
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-[680px] bg-white text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2">ID sản phẩm</th>
                  <th className="px-3 py-2">Tên sản phẩm</th>
                  <th className="px-3 py-2">Đã bán</th>
                  <th className="px-3 py-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_selling_products.map((product) => (
                  <tr key={product.product_id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{product.product_id}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{product.product_name}</td>
                    <td className="px-3 py-2 text-slate-700">{product.total_sold.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-2 text-slate-900">
                      <PriceText value={product.revenue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
