import { EmptyState } from '@/components/ui/EmptyState'
import { PriceText } from '@/components/ui/PriceText'
import type { DashboardTopSellingProduct } from '@/types/admin'

type AdminTopProductsTableProps = {
  products: DashboardTopSellingProduct[]
}

export function AdminTopProductsTable({ products }: AdminTopProductsTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Chưa có dữ liệu sản phẩm bán chạy"
        description="Dữ liệu sẽ hiển thị khi có đơn hàng đã giao và thanh toán."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="min-w-[640px] w-full bg-white text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-3 py-2.5 font-semibold">#</th>
            <th className="px-3 py-2.5 font-semibold">Sản phẩm</th>
            <th className="px-3 py-2.5 font-semibold">Đã bán</th>
            <th className="px-3 py-2.5 font-semibold">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={`${product.product_id}-${index}`} className="border-t border-slate-100">
              <td className="px-3 py-3 text-slate-600">{index + 1}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                      {product.product_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{product.product_name}</p>
                    <p className="text-xs text-slate-500">ID: {product.product_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-slate-700">{product.total_sold.toLocaleString('vi-VN')}</td>
              <td className="px-3 py-3 text-slate-900">
                <PriceText value={product.revenue} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
