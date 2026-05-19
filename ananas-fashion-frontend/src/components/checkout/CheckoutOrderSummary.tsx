import { Link } from 'react-router-dom'
import { CheckoutItemMini } from '@/components/checkout/CheckoutItemMini'
import { Button } from '@/components/ui/Button'
import { PriceText } from '@/components/ui/PriceText'
import type { Cart } from '@/types/cart'

type CheckoutOrderSummaryProps = {
  cart: Cart
  subtotal: number
  discountAmount: number
  shippingFee: number
  estimatedTotal: number
  isSubmitting: boolean
  onSubmit: () => Promise<void> | void
}

export function CheckoutOrderSummary({
  cart,
  subtotal,
  discountAmount,
  shippingFee,
  estimatedTotal,
  isSubmitting,
  onSubmit,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="space-y-4 border border-neutral-200 bg-white p-4 lg:sticky lg:top-20 lg:self-start">
      <div className="space-y-1 border-b border-neutral-200 pb-3">
        <h2 className="text-lg font-bold text-neutral-900">Đơn hàng của bạn</h2>
        <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">{cart.items.length} sản phẩm</p>
      </div>

      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <CheckoutItemMini key={item.id} item={item} />
        ))}
      </div>

      <div className="space-y-2 border-t border-neutral-200 pt-3 text-sm text-neutral-700">
        <div className="flex items-center justify-between">
          <span>Tạm tính</span>
          <PriceText value={subtotal} className="font-semibold text-neutral-900" />
        </div>
        <div className="flex items-center justify-between">
          <span>Giảm giá</span>
          <PriceText value={discountAmount} className="font-semibold text-neutral-900" />
        </div>
        <div className="flex items-center justify-between">
          <span>Phí vận chuyển</span>
          {shippingFee > 0 ? (
            <PriceText value={shippingFee} className="font-semibold text-neutral-900" />
          ) : (
            <span className="font-semibold text-emerald-700">Miễn phí</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
        <span className="text-sm font-bold uppercase tracking-[0.06em] text-neutral-700">Tổng thanh toán</span>
        <PriceText value={estimatedTotal} className="text-xl font-extrabold text-neutral-900" />
      </div>

      <p className="text-xs text-neutral-500">
        Quy tắc vận chuyển: đơn dưới 500.000₫ tính 30.000₫, từ 500.000₫ trở lên miễn phí.
      </p>

      <div className="space-y-2 pt-1">
        <Button
          type="button"
          className="h-11 w-full text-sm font-semibold uppercase tracking-[0.08em]"
          isLoading={isSubmitting}
          onClick={() => void onSubmit()}
        >
          Đặt hàng
        </Button>
        <Link
          to="/cart"
          className="inline-flex h-11 w-full items-center justify-center border border-neutral-900 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          Quay lại giỏ hàng
        </Link>
      </div>
    </aside>
  )
}
