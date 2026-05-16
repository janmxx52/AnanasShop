import { PriceText } from '@/components/ui/PriceText'
import type { OrderItem } from '@/types/order'

type OrderItemsTableProps = {
  items: OrderItem[]
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-[720px] bg-white text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-3 py-2">Sản phẩm</th>
            <th className="px-3 py-2">Phân loại</th>
            <th className="px-3 py-2">SKU</th>
            <th className="px-3 py-2">Đơn giá</th>
            <th className="px-3 py-2">Số lượng</th>
            <th className="px-3 py-2">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="px-3 py-2 text-slate-900">{item.product_name}</td>
              <td className="px-3 py-2 text-slate-700">{item.variant_name}</td>
              <td className="px-3 py-2 text-slate-700">{item.sku}</td>
              <td className="px-3 py-2 text-slate-900">
                <PriceText value={item.unit_price} />
              </td>
              <td className="px-3 py-2 text-slate-700">{item.quantity}</td>
              <td className="px-3 py-2 font-medium text-slate-900">
                <PriceText value={item.line_total} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
