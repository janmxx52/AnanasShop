import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('render label và placeholder đúng', () => {
    render(<Input label="Email" name="email" placeholder="Nhập email" />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nhập email')).toBeInTheDocument()
  })
})
