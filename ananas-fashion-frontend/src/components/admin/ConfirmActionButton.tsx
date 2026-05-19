import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/Button'

type ConfirmActionButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  confirmMessage: string
  onConfirm: () => void | Promise<void>
}

export function ConfirmActionButton({ confirmMessage, onConfirm, ...buttonProps }: ConfirmActionButtonProps) {
  const handleClick = () => {
    if (!window.confirm(confirmMessage)) {
      return
    }

    void onConfirm()
  }

  return <Button {...buttonProps} onClick={handleClick} />
}
