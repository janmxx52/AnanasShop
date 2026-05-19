import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '@/api/admin.api'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable } from '@/components/admin/AdminTable'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import type { DashboardStats } from '@/types/admin'

type MetricCard = {
  label: string
  value: string
  helper: string
  icon: string
}

function MetricStatCard({ label, value, helper, icon }: MetricCard) {
  return (
    <article className="border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-600">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{helper}</p>
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

  const metricCards = useMemo<MetricCard[]>(() => {
    if (!stats) {
      return []
    }

    return [
      {
        label: 'Tổng người dùng',
        value: stats.total_users.toLocaleString('vi-VN'),
        helper: 'Người dùng đang hoạt động trên hệ thống',
        icon: '👤',
      },
      {
        label: 'Tổng sản phẩm',
        value: stats.total_products.toLocaleString('vi-VN'),
        helper: 'Bao gồm cả sản phẩm đang tắt',
        icon: '📦',
      },
      {
        label: 'Tổng đơn hàng',
        value: stats.total_orders.toLocaleString('vi-VN'),
        helper: 'Số đơn ghi nhận từ trước đến nay',
        icon: '🧾',
      },
      {
        label: 'Tổng doanh thu',
        value: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(stats.total_revenue),
        helper: 'Chỉ tính đơn delivered + paid',
        icon: '💰',
      },
      {
        label: 'Đơn chờ xác nhận',
        value: stats.pending_orders.toLocaleString('vi-VN'),
        helper: 'Cần xử lý sớm trong vận hành',
        icon: '⏳',
      },
      {
        label: 'Đơn đã hủy',
        value: stats.cancelled_orders.toLocaleString('vi-VN'),
        helper: 'Theo dõi tỷ lệ hủy đơn',
        icon: '❌',
      },
      {
        label: 'Đơn đã giao',
        value: stats.delivered_orders.toLocaleString('vi-VN'),
        helper: 'Đơn hoàn tất giao hàng',
        icon: '✅',
      },
      {
        label: 'Biến thể sắp hết',
        value: stats.low_stock_variants.toLocaleString('vi-VN'),
        helper: 'Stock > 0 và ≤ 5',
        icon: '⚠️',
      },
      {
        label: 'Biến thể hết hàng',
        value: stats.out_of_stock_variants.toLocaleString('vi-VN'),
        helper: 'Stock = 0',
        icon: '🚫',
      },
      {
        label: 'Tổng đánh giá',
        value: stats.total_reviews.toLocaleString('vi-VN'),
        helper: 'Chỉ tính đánh giá đã duyệt',
        icon: '📝',
      },
      {
        label: 'Điểm đánh giá TB',
        value: stats.average_rating.toFixed(1),
        helper: 'Trung bình toàn hệ thống',
        icon: '⭐',
      },
    ]
  }, [stats])

  if (isLoading) {
    return <LoadingState message="Đang tải thống kê bảng điều khiển..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (!stats) {
    return <EmptyState title="Chưa có dữ liệu bảng điều khiển" />
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title="Bảng điều khiển quản trị"
        description="Theo dõi nhanh chỉ số vận hành theo dữ liệu hệ thống."
        actions={
          <Button type="button" variant="secondary" onClick={() => void fetchStats()}>
            Tải lại dữ liệu
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricStatCard key={card.label} {...card} />
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Đơn hàng gần đây" description="Hiển thị 5 đơn mới nhất">
          {stats.recent_orders.length === 0 ? (
            <EmptyState title="Chưa có đơn hàng gần đây" />
          ) : (
            <AdminTable minWidthClassName="min-w-[760px]">
              <thead className="bg-neutral-50 text-left text-neutral-600">
                <tr>
                  <th className="px-3 py-2">Mã đơn</th>
                  <th className="px-3 py-2">Khách hàng</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Thanh toán</th>
                  <th className="px-3 py-2">Tổng tiền</th>
                  <th className="px-3 py-2">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => (
                  <tr key={order.order_code} className="border-t border-neutral-100">
                    <td className="px-3 py-2 font-medium text-neutral-900">{order.order_code}</td>
                    <td className="px-3 py-2 text-neutral-700">{order.customer_name || 'Không có'}</td>
                    <td className="px-3 py-2">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-2">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-3 py-2 text-neutral-900">
                      <PriceText value={order.total} />
                    </td>
                    <td className="px-3 py-2 text-neutral-700">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminCard>

        <AdminCard title="Sản phẩm bán chạy" description="Top 5 sản phẩm theo số lượng bán">
          {stats.top_selling_products.length === 0 ? (
            <EmptyState title="Chưa có dữ liệu sản phẩm bán chạy" />
          ) : (
            <AdminTable minWidthClassName="min-w-[620px]">
              <thead className="bg-neutral-50 text-left text-neutral-600">
                <tr>
                  <th className="px-3 py-2">ID sản phẩm</th>
                  <th className="px-3 py-2">Tên sản phẩm</th>
                  <th className="px-3 py-2">Đã bán</th>
                  <th className="px-3 py-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_selling_products.map((product) => (
                  <tr key={product.product_id} className="border-t border-neutral-100">
                    <td className="px-3 py-2 text-neutral-700">{product.product_id}</td>
                    <td className="px-3 py-2 font-medium text-neutral-900">{product.product_name}</td>
                    <td className="px-3 py-2 text-neutral-700">{product.total_sold.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-2 text-neutral-900">
                      <PriceText value={product.revenue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminCard>
      </div>
    </section>
  )
}
