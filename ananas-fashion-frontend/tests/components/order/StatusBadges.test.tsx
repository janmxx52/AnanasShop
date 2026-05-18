import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'

describe('OrderStatusBadge', () => {
  it('map trạng thái đơn sang tiếng Việt đúng', () => {
    render(<OrderStatusBadge status="processing" />)
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
  })
})

describe('PaymentStatusBadge', () => {
  it('map trạng thái thanh toán sang tiếng Việt đúng', () => {
    render(<PaymentStatusBadge status="paid" />)
    expect(screen.getByText('Đã thanh toán')).toBeInTheDocument()
  })
})
