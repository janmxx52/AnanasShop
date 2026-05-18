import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductLite } from '@/types/product'
import { renderWithProviders } from '../../helpers/renderWithProviders'

vi.mock('@/components/wishlist/WishlistButton', () => ({
  WishlistButton: () => <button type="button">Thêm vào yêu thích</button>,
}))

describe('ProductCard', () => {
  it('render tên sản phẩm, giá và nút wishlist', () => {
    const product: ProductLite = {
      id: 1,
      name: 'Ananas Vintas',
      slug: 'ananas-vintas',
      description: null,
      base_price: 1200000,
      sale_price: 990000,
      is_active: true,
      rating_avg: 4.8,
      review_count: 24,
      variants: [],
      images: [],
    }

    renderWithProviders(<ProductCard product={product} />)

    expect(screen.getByText('Ananas Vintas')).toBeInTheDocument()
    expect(screen.getByText(/990\.000/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thêm vào yêu thích' })).toBeInTheDocument()
  })
})
