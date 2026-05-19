import { ANANAS_IMAGE_FALLBACK } from '@/data/productImageMap'
import { resolveProductCardImages } from '@/lib/product-images'
import type { CartItem } from '@/types/cart'
import type { ProductLite } from '@/types/product'

function toValidImage(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function resolveCartItemImage(item: CartItem): string {
  const directCandidates = [
    toValidImage(item.image_url),
    toValidImage(item.product?.image_url),
    toValidImage(item.product?.primary_image),
    toValidImage(item.variant?.image_url),
  ]

  const directImage = directCandidates.find((candidate) => candidate)
  if (directImage) {
    return directImage
  }

  const productImages = item.product?.images ?? []
  if (productImages.length > 0) {
    const primary = productImages.find((image) => image.is_primary) ?? productImages[0]
    const primaryUrl = toValidImage(primary?.url)
    if (primaryUrl) {
      return primaryUrl
    }
  }

  const fallbackProduct: ProductLite = {
    id: item.product?.id ?? item.product_id ?? item.id,
    name: item.product?.name ?? 'Sản phẩm',
    slug: item.product?.slug ?? `cart-item-${item.id}`,
    description: null,
    base_price: item.unit_price ?? 0,
    sale_price: null,
    is_active: true,
    rating_avg: null,
    review_count: 0,
    variants: item.variant
      ? [
          {
            id: item.variant.id,
            size: item.variant.size,
            color: item.variant.color,
            color_hex: null,
            sku: item.variant.sku,
            stock: Math.max(item.quantity, 1),
            price: item.unit_price ?? 0,
          },
        ]
      : [],
    images: [],
  }

  return resolveProductCardImages(fallbackProduct).mainImage || ANANAS_IMAGE_FALLBACK
}
