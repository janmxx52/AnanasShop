

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '@/api/product.api'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ANANAS_IMAGE_FALLBACK, CATEGORY_IMAGE_SAMPLES } from '@/data/productImageMap'
import { parseApiError } from '@/lib/api-helpers'
import type { ProductLite } from '@/types/product'

const CATEGORY_BLOCKS = [
  {
    key: 'giay',
    title: 'Giày',
    description: 'Sneaker và các dòng giày nổi bật.',
    link: '/products?category=giay',
  },
  {
    key: 'ao',
    title: 'Áo',
    description: 'Áo thun, áo khoác và trang phục hằng ngày.',
    link: '/products?category=ao',
  },
  {
    key: 'phu-kien',
    title: 'Phụ kiện',
    description: 'Mũ, túi, balo và phụ kiện phối đồ.',
    link: '/products?category=phu-kien',
  },
  {
    key: 'vo',
    title: 'Vớ',
    description: 'Vớ thời trang cho phong cách năng động.',
    link: '/products?category=vo',
  },
] as const

function pickCategoryImage(category: string): string {
  const samples = CATEGORY_IMAGE_SAMPLES[category]
  return samples?.[0] ?? ANANAS_IMAGE_FALLBACK
}

export function HomePage() {
  const [products, setProducts] = useState<ProductLite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await productApi.list({
          sort: 'newest',
          page: 1,
          per_page: 24,
        })
        setProducts(response.data)
      } catch (error) {
        const apiError = parseApiError(error)
        setErrorMessage(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProducts()
  }, [])

  const newProducts = useMemo(() => products.slice(0, 8), [products])

  const topSellingProducts = useMemo(
    () => [...products].sort((left, right) => (right.review_count ?? 0) - (left.review_count ?? 0)).slice(0, 8),
    [products],
  )

  const saleProducts = useMemo(
    () => products.filter((product) => product.sale_price !== null && product.sale_price < product.base_price).slice(0, 8),
    [products],
  )

  return (
    <section className="space-y-10">
      <section className="overflow-hidden border border-neutral-200 bg-white">
        <picture>
          <source media="(max-width: 768px)" srcSet="/ananas-assets/misc/Mobile_Homepage_Banner-copy-1.jpg" />
          <img
            src="/ananas-assets/misc/Desktop_Homepage_Banner.jpg"
            alt="Ananas Fashion"
            className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[440px]"
          />
        </picture>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_BLOCKS.map((category) => (
          <Link
            key={category.key}
            to={category.link}
            className="group overflow-hidden border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
              <img
                src={pickCategoryImage(category.key)}
                alt={category.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-4">
              <h2 className="text-base font-semibold text-neutral-900">{category.title}</h2>
              <p className="text-sm text-neutral-600">{category.description}</p>
            </div>
          </Link>
        ))}
      </section>

      {isLoading ? <LoadingState message="Đang tải sản phẩm nổi bật..." /> : null}
      {!isLoading && errorMessage ? <ErrorState message={errorMessage} /> : null}
      {!isLoading && !errorMessage && products.length === 0 ? (
        <EmptyState title="Chưa có sản phẩm hiển thị" description="Vui lòng quay lại sau để khám phá bộ sưu tập mới." />
      ) : null}

      {!isLoading && !errorMessage && products.length > 0 ? (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-neutral-900">Sản phẩm mới</h2>
              <Link to="/products?sort=newest" className="text-sm font-semibold text-[#f15a24] hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-neutral-900">Bán chạy</h2>
              <Link to="/products?sort=featured" className="text-sm font-semibold text-[#f15a24] hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topSellingProducts.map((product) => (
                <ProductCard key={`top-${product.id}`} product={product} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-neutral-900">Sale Off</h2>
              <Link to="/products?sort=price_asc" className="text-sm font-semibold text-[#f15a24] hover:underline">
                Xem tất cả
              </Link>
            </div>
            {saleProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {saleProducts.map((product) => (
                  <ProductCard key={`sale-${product.id}`} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState title="Chưa có sản phẩm giảm giá" description="Hãy theo dõi để không bỏ lỡ ưu đãi mới." />
            )}
          </section>
        </>
      ) : null}
    </section>

  )
}
