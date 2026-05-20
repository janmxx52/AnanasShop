import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriceText } from '@/components/ui/PriceText'
import type { DashboardRecentOrder } from '@/types/admin'

type AdminRecentOrdersTableProps = {
  orders: DashboardRecentOrder[]
}

export function AdminRecentOrdersTable({ orders }: AdminRecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Chưa có đơn hàng gần đây"
        description="Dữ liệu sẽ hiển thị khi có phát sinh đơn hàng mới."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="min-w-[840px] w-full bg-white text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Mã đơn</th>
            <th className="px-3 py-2.5 font-semibold">Khách hàng</th>
            <th className="px-3 py-2.5 font-semibold">Trạng thái đơn</th>
            <th className="px-3 py-2.5 font-semibold">Thanh toán</th>
            <th className="px-3 py-2.5 font-semibold">Tổng tiền</th>
            <th className="px-3 py-2.5 font-semibold">Ngày tạo</th>
            <th className="px-3 py-2.5 text-right font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_code} className="border-t border-slate-100">
              <td className="px-3 py-3 font-semibold text-slate-900">{order.order_code}</td>
              <td className="px-3 py-3 text-slate-700">{order.customer_name || 'Khách lẻ'}</td>
              <td className="px-3 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-3 py-3">
                <PaymentStatusBadge status={order.payment_status} />
              </td>
              <td className="px-3 py-3 text-slate-900">
                <PriceText value={order.total} />
              </td>
              <td className="px-3 py-3 text-slate-600">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
              <td className="px-3 py-3 text-right">
                <Link
                  to={`/admin/orders/${order.order_code}`}
                  className="inline-flex items-center rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Xem
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
