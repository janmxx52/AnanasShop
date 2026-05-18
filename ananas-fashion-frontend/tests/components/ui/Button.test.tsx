import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('render và click được', () => {
    const onClick = vi.fn()

    render(
      <Button onClick={onClick} type="button">
        Bấm thử
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Bấm thử' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
