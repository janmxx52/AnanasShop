import { Link } from 'react-router-dom'
import { PriceText } from '@/components/ui/PriceText'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { resolveProductCardImages } from '@/lib/product-images'
import { getProductDisplayPrice, getProductListCardPrice } from '@/lib/pricing'
import type { ProductLite } from '@/types/product'

type ProductCardProps = {
  product: ProductLite
}

function hasVariantOutOfStock(product: ProductLite) {
  if (!product.variants || product.variants.length === 0) {
    return false
  }

  return product.variants.every((variant) => variant.stock <= 0)
}

export function ProductCard({ product }: ProductCardProps) {
  const imageSet = resolveProductCardImages(product)
  const currentPrice = getProductListCardPrice(product)
  const displayPrice = getProductDisplayPrice(product)
  const isOnSale = product.sale_price !== null && product.sale_price < product.base_price
  const saleDelta = isOnSale ? product.base_price - displayPrice : 0
  const originalPrice = isOnSale ? currentPrice + saleDelta : null
  const isSoldOut = hasVariantOutOfStock(product)

  return (
    <article className="group overflow-hidden border border-neutral-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_16px_28px_-18px_rgba(0,0,0,0.45)]">
      <div className="relative">
        <Link to={`/products/${product.slug}`} className="block overflow-hidden bg-neutral-100">
          <div className="relative aspect-square">
            <img
              src={imageSet.mainImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
            {imageSet.hoverImage ? (
              <img
                src={imageSet.hoverImage}
                alt={`${product.name} - ảnh phụ`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
                loading="lazy"
              />
            ) : null}
            {isSoldOut ? (
              <div className="absolute inset-0 bg-black/45" />
            ) : null}
          </div>
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
          {product.is_featured ? (
            <span className="rounded bg-black px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
              Mới
            </span>
          ) : null}
          {isOnSale ? (
            <span className="rounded bg-[#f15a24] px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
              Sale
            </span>
          ) : null}
          {isSoldOut ? (
            <span className="rounded bg-neutral-800 px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
              Hết hàng
            </span>
          ) : null}
        </div>

        <WishlistButton
          productId={product.id}
          compact
          className="absolute right-2 top-2 h-8 w-8 border-white/80 bg-white/95 text-sm shadow-sm backdrop-blur"
        />

        {!isSoldOut ? (
          <Link
            to={`/products/${product.slug}`}
            className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center bg-black/75 px-3 py-2 text-[11px] font-bold tracking-[0.12em] text-white uppercase opacity-0 transition duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 md:inline-flex"
          >
            Mua ngay
          </Link>
        ) : (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden items-center justify-center bg-black/70 px-3 py-2 text-[11px] font-bold tracking-[0.12em] text-white uppercase md:inline-flex">
            Tạm hết hàng
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-2 min-h-[2.8rem] text-sm font-semibold leading-5 text-neutral-900 transition hover:text-[#f15a24]"
        >
          {product.name}
        </Link>

        <div className="flex items-end justify-between gap-2">
          <div className="space-y-0.5">
            <PriceText value={currentPrice} className="text-base font-bold text-neutral-900" />
            {originalPrice ? (
              <PriceText value={originalPrice} className="text-xs text-neutral-400 line-through" />
            ) : null}
          </div>
          <span className="text-xs font-medium text-neutral-500">
            {product.rating_avg ?? 0} ★ ({product.review_count ?? 0})
          </span>
        </div>
      </div>
    </article>
  )
}
