import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'

describe('Loading/Error/Empty states', () => {
  it('LoadingState hiển thị tiếng Việt mặc định', () => {
    render(<LoadingState />)
    expect(screen.getByText('Đang tải...')).toBeInTheDocument()
  })

  it('ErrorState hiển thị message tiếng Việt', () => {
    render(<ErrorState message="Có lỗi xảy ra." />)
    expect(screen.getByText('Có lỗi xảy ra.')).toBeInTheDocument()
  })

  it('EmptyState hiển thị title/description tiếng Việt', () => {
    render(<EmptyState title="Chưa có dữ liệu" description="Vui lòng thử lại sau." />)
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng thử lại sau.')).toBeInTheDocument()
  })
})
