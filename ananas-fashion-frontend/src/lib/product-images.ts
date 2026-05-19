import {
  ANANAS_IMAGE_FALLBACK,
  CATEGORY_IMAGE_SAMPLES,
  PRODUCT_IMAGE_MAP,
  type ProductImageMapItem,
} from '@/data/productImageMap'
import type { ProductLite } from '@/types/product'

type ResolvedImageSource = 'api' | 'mapping' | 'fallback'

export type ResolvedProductImages = {
  source: ResolvedImageSource
  mainImage: string
  hoverImage: string | null
  images: string[]
  matchedCode: string | null
}

const PRODUCT_CODE_PATTERN = /[A-Z0-9]{5,10}/g

function normalizeImageList(images: Array<string | null | undefined>): string[] {
  const unique = new Set<string>()

  images.forEach((image) => {
    if (!image) {
      return
    }

    const value = image.trim()
    if (!value) {
      return
    }

    unique.add(value)
  })

  return Array.from(unique)
}

function normalizeToken(value: string): string {
  return value.trim().toUpperCase()
}

function collectCodeCandidates(product: ProductLite): string[] {
  const candidates = new Set<string>()

  const addMatches = (rawValue: string | null | undefined) => {
    if (!rawValue) {
      return
    }

    const upperValue = rawValue.toUpperCase()

    const directNormalized = normalizeToken(upperValue.replace(/[^A-Z0-9]/g, ''))
    if (directNormalized.length >= 5) {
      candidates.add(directNormalized)
    }

    const matches = upperValue.match(PRODUCT_CODE_PATTERN)
    matches?.forEach((match) => candidates.add(normalizeToken(match)))
  }

  addMatches(product.name)
  addMatches(product.slug)

  product.variants?.forEach((variant) => {
    addMatches(variant.sku)
  })

  return Array.from(candidates)
}

function resolveMappedEntry(product: ProductLite): ProductImageMapItem | null {
  const candidates = collectCodeCandidates(product)

  for (const candidate of candidates) {
    const mapped = PRODUCT_IMAGE_MAP[candidate]
    if (mapped) {
      return mapped
    }
  }

  return null
}

function resolveCategoryFallbackImage(product: ProductLite): string {
  const categorySlug = product.category?.slug?.toLowerCase()

  if (categorySlug) {
    const mappedSamples = CATEGORY_IMAGE_SAMPLES[categorySlug]
    if (mappedSamples?.length) {
      return mappedSamples[0]
    }
  }

  const allSamples = Object.values(CATEGORY_IMAGE_SAMPLES).flat()
  return allSamples[0] ?? ANANAS_IMAGE_FALLBACK
}

function resolveApiImages(product: ProductLite): ResolvedProductImages | null {
  const apiImages = product.images ?? []
  if (!apiImages.length) {
    return null
  }

  const primary = apiImages.find((image) => image.is_primary) ?? apiImages[0]
  const imageList = normalizeImageList([
    primary?.url,
    ...apiImages.filter((image) => image.id !== primary.id).map((image) => image.url),
  ])

  if (!imageList.length) {
    return null
  }

  return {
    source: 'api',
    mainImage: imageList[0],
    hoverImage: imageList[1] ?? null,
    images: imageList,
    matchedCode: null,
  }
}

function resolveMappedImages(product: ProductLite): ResolvedProductImages | null {
  const mappedEntry = resolveMappedEntry(product)

  if (!mappedEntry) {
    return null
  }

  const imageList = normalizeImageList([mappedEntry.mainImage, ...(mappedEntry.images ?? [])])

  if (!imageList.length) {
    return null
  }

  return {
    source: 'mapping',
    mainImage: imageList[0],
    hoverImage: mappedEntry.hoverImage && imageList.includes(mappedEntry.hoverImage) ? mappedEntry.hoverImage : imageList[1] ?? null,
    images: imageList,
    matchedCode: mappedEntry.productCode,
  }
}

function resolveFallbackImages(product: ProductLite): ResolvedProductImages {
  const fallbackImage = resolveCategoryFallbackImage(product)

  return {
    source: 'fallback',
    mainImage: fallbackImage,
    hoverImage: null,
    images: [fallbackImage],
    matchedCode: null,
  }
}

export function resolveProductCardImages(product: ProductLite): ResolvedProductImages {
  const apiImages = resolveApiImages(product)
  if (apiImages) {
    return apiImages
  }

  const mappedImages = resolveMappedImages(product)
  if (mappedImages) {
    return mappedImages
  }

  return resolveFallbackImages(product)
}

export function resolveProductDetailImages(product: ProductLite): ResolvedProductImages {
  const apiImages = resolveApiImages(product)
  if (apiImages) {
    return apiImages
  }

  const mappedImages = resolveMappedImages(product)
  if (mappedImages) {
    return mappedImages
  }

  return resolveFallbackImages(product)
}
