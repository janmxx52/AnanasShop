import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { voucherApi } from '@/api/voucher.api'
import { VoucherBox } from '@/components/checkout/VoucherBox'
import type { VoucherCheckResult } from '@/types/voucher'
import { renderWithProviders } from '../../helpers/renderWithProviders'

vi.mock('@/api/voucher.api', () => ({
  voucherApi: {
    checkVoucher: vi.fn(),
  },
}))

describe('VoucherBox', () => {
  it('validate mã giảm giá rỗng', async () => {
    const onVoucherChecked = vi.fn()

    renderWithProviders(
      <VoucherBox
        voucherCode=""
        onVoucherCodeChange={vi.fn()}
        onVoucherChecked={onVoucherChecked}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }))

    const messages = await screen.findAllByText('Vui lòng nhập mã giảm giá.')
    expect(messages.length).toBeGreaterThan(0)
    expect(onVoucherChecked).toHaveBeenCalledWith(null)
  })

  it('gọi callback khi kiểm tra voucher thành công', async () => {
    const mockResult: VoucherCheckResult = {
      code: 'SALE10',
      type: 'percent',
      value: 10,
      subtotal: 500000,
      discount: 50000,
      total_after: 450000,
    }
    const onVoucherChecked = vi.fn()
    vi.mocked(voucherApi.checkVoucher).mockResolvedValueOnce(mockResult)

    renderWithProviders(
      <VoucherBox
        voucherCode="SALE10"
        onVoucherCodeChange={vi.fn()}
        onVoucherChecked={onVoucherChecked}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }))

    await waitFor(() => {
      expect(voucherApi.checkVoucher).toHaveBeenCalledWith({ code: 'SALE10' })
      expect(onVoucherChecked).toHaveBeenCalledWith(mockResult)
    })
  })
})
