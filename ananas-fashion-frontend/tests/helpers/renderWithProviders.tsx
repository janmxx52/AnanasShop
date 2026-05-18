import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/app/ToastContext'

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string
}

export function renderWithProviders(ui: ReactElement, { route = '/', ...options }: ExtendedRenderOptions = {}) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </ToastProvider>,
    options,
  )
}
