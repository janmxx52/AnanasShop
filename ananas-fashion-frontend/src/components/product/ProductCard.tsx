import { Link } from 'react-router-dom'
import { PriceText } from '@/components/ui/PriceText'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { getProductListCardPrice } from '@/lib/pricing'
import type { ProductLite } from '@/types/product'

type ProductCardProps = {
  product: ProductLite
}

function getPrimaryImage(product: ProductLite) {
  if (!product.images || product.images.length === 0) {
    return null
  }

  return product.images.find((image) => image.is_primary) ?? product.images[0]
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = getPrimaryImage(product)
  const displayPrice = getProductListCardPrice(product)

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-slate-100">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Không có ảnh</div>
          )}
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <Link to={`/products/${product.slug}`} className="line-clamp-2 font-medium text-slate-900 hover:underline">
          {product.name}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <PriceText value={displayPrice} className="text-sm font-semibold text-slate-900" />
          <span className="text-xs text-slate-600">
            {product.rating_avg ?? 0} ★ ({product.review_count ?? 0})
          </span>
        </div>

        <WishlistButton productId={product.id} />
      </div>
    </article>
  )
}
