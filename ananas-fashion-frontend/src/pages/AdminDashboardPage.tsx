import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { adminApi } from '@/api/admin.api'
import { AdminInventorySummary } from '@/components/admin/AdminInventorySummary'
import { AdminMetricCard } from '@/components/admin/AdminMetricCard'
import { AdminOrderChart } from '@/components/admin/AdminOrderChart'
import { AdminOrderStatusChart } from '@/components/admin/AdminOrderStatusChart'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminRecentOrdersTable } from '@/components/admin/AdminRecentOrdersTable'
import { AdminRevenueChart } from '@/components/admin/AdminRevenueChart'
import { AdminSectionCard } from '@/components/admin/AdminSectionCard'
import { AdminTopProductsTable } from '@/components/admin/AdminTopProductsTable'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import type { AdminDashboardAnalytics, AdminDashboardStats } from '@/types/admin'

type MetricCardModel = {
  label: string
  value: ReactNode
  helper: string
  icon: string
  tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  growth?: number | null
  growthLabel?: string
}

function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN')
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<AdminDashboardAnalytics | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)
    setStatsError(null)

    try {
      const response = await adminApi.dashboardStats()
      setStats(response)
    } catch (error) {
      const apiError = parseApiError(error)
      setStatsError(apiError.message)
      setStats(null)
    } finally {
      setIsStatsLoading(false)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    setIsAnalyticsLoading(true)
    setAnalyticsError(null)

    try {
      const response = await adminApi.dashboardAnalytics()
      setAnalytics(response)
    } catch (error) {
      const apiError = parseApiError(error)
      setAnalyticsError(apiError.message)
      setAnalytics(null)
    } finally {
      setIsAnalyticsLoading(false)
    }
  }, [])

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.allSettled([fetchStats(), fetchAnalytics()])
    setUpdatedAt(new Date())
    setIsRefreshing(false)
  }, [fetchAnalytics, fetchStats])

  useEffect(() => {
    void refreshDashboard()
  }, [refreshDashboard])

  const lastUpdatedText = useMemo(() => {
    if (!updatedAt) {
      return 'Chưa có dữ liệu cập nhật'
    }

    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(updatedAt)
  }, [updatedAt])

  const kpiCards = useMemo<MetricCardModel[]>(() => {
    if (!stats) {
      return []
    }

    const metrics = analytics?.metrics

    return [
      {
        label: 'Tổng khách hàng',
        value: formatNumber(stats.total_users),
        helper: 'Tổng tài khoản đang hoạt động',
        icon: '👥',
        tone: 'neutral',
        growth: metrics?.customer_growth_percent ?? null,
        growthLabel: 'so với tháng trước',
      },
      {
        label: 'Tổng đơn hàng',
        value: formatNumber(stats.total_orders),
        helper: 'Tổng đơn phát sinh trong hệ thống',
        icon: '🧾',
        tone: 'primary',
        growth: metrics?.order_growth_percent ?? null,
        growthLabel: 'so với tháng trước',
      },
      {
        label: 'Tổng doanh thu',
        value: <PriceText value={stats.total_revenue} />,
        helper: 'Chỉ tính đơn đã giao và đã thanh toán',
        icon: '💰',
        tone: 'success',
        growth: metrics?.revenue_growth_percent ?? null,
        growthLabel: 'so với tháng trước',
      },
      {
        label: 'Tổng sản phẩm',
        value: formatNumber(stats.total_products),
        helper: 'Tổng sản phẩm trong danh mục',
        icon: '📦',
        tone: 'neutral',
      },
      {
        label: 'Doanh thu hôm nay',
        value: metrics ? <PriceText value={metrics.today_revenue} /> : '—',
        helper: 'Doanh thu theo ngày hiện tại',
        icon: '📅',
        tone: 'primary',
      },
      {
        label: 'Doanh thu tháng này',
        value: metrics ? <PriceText value={metrics.this_month_revenue} /> : '—',
        helper: 'Tính từ đầu tháng đến hiện tại',
        icon: '📈',
        tone: 'success',
      },
      {
        label: 'Sản phẩm sắp hết hàng',
        value: formatNumber(stats.low_stock_variants),
        helper: 'Stock > 0 và ≤ 5',
        icon: '⚠️',
        tone: 'warning',
      },
      {
        label: 'Sản phẩm hết hàng',
        value: formatNumber(stats.out_of_stock_variants),
        helper: 'Stock ≤ 0',
        icon: '🚫',
        tone: 'danger',
      },
    ]
  }, [analytics, stats])

  const recentOrders = analytics?.recent_orders ?? stats?.recent_orders ?? []
  const topProducts = analytics?.top_selling_products ?? stats?.top_selling_products ?? []

  if (isStatsLoading) {
    return <LoadingState message="Đang tải dữ liệu dashboard..." />
  }

  if (statsError || !stats) {
    return (
      <section className="space-y-4">
        <ErrorState message={statsError ?? 'Không tải được dữ liệu dashboard.'} />
        <Button type="button" variant="secondary" onClick={() => void refreshDashboard()} disabled={isRefreshing}>
          Thử tải lại
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Tổng quan hệ thống"
        description="Theo dõi doanh thu, đơn hàng, sản phẩm và hoạt động bán hàng."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
              Cập nhật mới nhất: {lastUpdatedText}
            </span>
            <Button type="button" variant="secondary" onClick={() => void refreshDashboard()} disabled={isRefreshing}>
              {isRefreshing ? 'Đang cập nhật...' : 'Tải lại dữ liệu'}
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <AdminMetricCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <AdminSectionCard
          className="xl:col-span-8"
          title="Doanh thu 12 tháng gần nhất"
          description="Biểu đồ doanh thu từ đơn đã giao và đã thanh toán."
        >
          {isAnalyticsLoading ? (
            <LoadingState message="Đang tải biểu đồ doanh thu..." />
          ) : analytics ? (
            <AdminRevenueChart chart={analytics.revenue_chart} />
          ) : (
            <ErrorState message={analyticsError ?? 'Không tải được dữ liệu biểu đồ doanh thu.'} />
          )}
        </AdminSectionCard>

        <AdminSectionCard
          className="xl:col-span-4"
          title="Tồn kho biến thể"
          description="Theo dõi nhanh sức khỏe tồn kho."
        >
          {isAnalyticsLoading ? (
            <LoadingState message="Đang tải dữ liệu tồn kho..." />
          ) : analytics ? (
            <AdminInventorySummary inventory={analytics.inventory} />
          ) : (
            <ErrorState message={analyticsError ?? 'Không tải được dữ liệu tồn kho.'} />
          )}
        </AdminSectionCard>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <AdminSectionCard
          className="xl:col-span-7"
          title="Số lượng đơn hàng theo tháng"
          description="Tổng số đơn hàng phát sinh theo từng tháng."
        >
          {isAnalyticsLoading ? (
            <LoadingState message="Đang tải biểu đồ đơn hàng..." />
          ) : analytics ? (
            <AdminOrderChart chart={analytics.order_chart} />
          ) : (
            <ErrorState message={analyticsError ?? 'Không tải được dữ liệu biểu đồ đơn hàng.'} />
          )}
        </AdminSectionCard>

        <AdminSectionCard
          className="xl:col-span-5"
          title="Phân bổ trạng thái đơn hàng"
          description="Tỷ trọng các trạng thái đơn hàng hiện tại."
        >
          {isAnalyticsLoading ? (
            <LoadingState message="Đang tải biểu đồ trạng thái đơn..." />
          ) : analytics ? (
            <AdminOrderStatusChart orderStatus={analytics.order_status} />
          ) : (
            <ErrorState message={analyticsError ?? 'Không tải được dữ liệu trạng thái đơn hàng.'} />
          )}
        </AdminSectionCard>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <AdminSectionCard
          className="xl:col-span-7"
          title="Đơn hàng gần đây"
          description="5 đơn hàng mới nhất trong hệ thống."
        >
          <AdminRecentOrdersTable orders={recentOrders} />
        </AdminSectionCard>

        <AdminSectionCard
          className="xl:col-span-5"
          title="Sản phẩm bán chạy"
          description="Top sản phẩm theo số lượng bán."
        >
          <AdminTopProductsTable products={topProducts} />
        </AdminSectionCard>
      </section>

      {analyticsError && !isAnalyticsLoading ? (
        <ErrorState message={`Không tải được analytics nâng cao: ${analyticsError}. Dashboard vẫn dùng dữ liệu stats cơ bản.`} />
      ) : null}
    </section>
  )
}
