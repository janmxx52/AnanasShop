import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PriceText } from '@/components/ui/PriceText'

describe('PriceText', () => {
  it('format tiền theo locale vi-VN', () => {
    render(<PriceText value={1234567} />)
    const text = screen.getByText((content) => content.includes('₫'))
    expect(text.textContent).toContain('1.234.567')
  })
})
