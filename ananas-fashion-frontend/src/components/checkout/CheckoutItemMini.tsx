import { PriceText } from '@/components/ui/PriceText'
import { resolveCartItemImage } from '@/lib/cart-images'
import type { CartItem } from '@/types/cart'

type CheckoutItemMiniProps = {
  item: CartItem
}

function resolveLineTotal(item: CartItem): number {
  if (typeof item.subtotal === 'number') {
    return item.subtotal
  }

  if (typeof item.unit_price === 'number') {
    return item.unit_price * item.quantity
  }

  return 0
}

export function CheckoutItemMini({ item }: CheckoutItemMiniProps) {
  const itemImage = resolveCartItemImage(item)
  const lineTotal = resolveLineTotal(item)

  return (
    <article className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
      <div className="aspect-square overflow-hidden border border-neutral-200 bg-neutral-100">
        <img src={itemImage} alt={item.product?.name ?? 'Sản phẩm'} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 space-y-1">
        <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
          {item.product?.name ?? 'Sản phẩm không xác định'}
        </p>
        <p className="text-xs text-neutral-500">
          Size: {item.variant?.size ?? '-'} • Màu: {item.variant?.color ?? '-'}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">SL: {item.quantity}</span>
          <PriceText value={lineTotal} className="font-semibold text-neutral-900" />
        </div>
      </div>
    </article>
  )
}
