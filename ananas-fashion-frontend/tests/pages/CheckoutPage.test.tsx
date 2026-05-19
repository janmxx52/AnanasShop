import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartApi } from '@/api/cart.api'
import { orderApi } from '@/api/order.api'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { renderWithProviders } from '../helpers/renderWithProviders'

vi.mock('@/app/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('@/api/cart.api', () => ({
  cartApi: {
    getCart: vi.fn(),
  },
}))

vi.mock('@/api/order.api', () => ({
  orderApi: {
    guestCheckout: vi.fn(),
    userCheckout: vi.fn(),
  },
}))

vi.mock('@/components/checkout/CheckoutSteps', () => ({
  CheckoutSteps: () => <div data-testid="checkout-steps" />,
}))

vi.mock('@/components/checkout/VoucherBox', () => ({
  VoucherBox: ({
    voucherCode,
    onVoucherCodeChange,
  }: {
    voucherCode: string
    onVoucherCodeChange: (value: string) => void
  }) => (
    <label>
      voucher-code
      <input
        aria-label="voucher-code"
        value={voucherCode}
        onChange={(event) => onVoucherCodeChange((event.target as HTMLInputElement).value)}
      />
    </label>
  ),
}))

vi.mock('@/components/checkout/CheckoutOrderSummary', () => ({
  CheckoutOrderSummary: ({ onSubmit }: { onSubmit: () => Promise<void> | void }) => (
    <button type="button" onClick={() => void onSubmit()}>
      submit-checkout
    </button>
  ),
}))

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits voucher_code to guest checkout payload', async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue({
      id: 1,
      owner: { type: 'guest', guest_token: 'guest-token' },
      total: 120000,
      items: [
        {
          id: 10,
          product_id: 100,
          variant_id: 1000,
          quantity: 1,
          unit_price: 120000,
          subtotal: 120000,
          product: { id: 100, name: 'Demo Product', slug: 'demo-product' },
          variant: { id: 1000, size: '42', color: 'Black', sku: 'SKU-42-BLACK' },
        },
      ],
    })

    vi.mocked(orderApi.guestCheckout).mockResolvedValue({
      id: 99,
      code: 'ANS-TEST-001',
      status: 'pending',
      subtotal: 120000,
      discount_amount: 10000,
      shipping_fee: 30000,
      total: 140000,
      payment_method: 'cod',
      payment_status: 'pending',
      voucher_code: 'SALE10',
      customer: { user_id: null, guest_name: 'Guest', guest_email: 'guest@example.com' },
      shipping: { name: 'Guest', phone: '0900000000', address: 'Demo Street' },
      note: null,
      items: [],
      created_at: '2026-05-19 10:00:00',
    })

    renderWithProviders(<CheckoutPage />, { route: '/checkout' })

    await waitFor(() => {
      expect(cartApi.getCart).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByLabelText('voucher-code'), {
      target: { value: 'SALE10' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'submit-checkout' }))

    await waitFor(() => {
      expect(orderApi.guestCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          voucher_code: 'SALE10',
          payment_method: 'cod',
        }),
      )
    })
  })
})
