type CheckoutStepKey = 'cart' | 'checkout' | 'success'

type CheckoutStepsProps = {
  current: CheckoutStepKey
}

const STEPS: Array<{ key: CheckoutStepKey; label: string; index: number }> = [
  { key: 'cart', label: 'Giỏ hàng', index: 1 },
  { key: 'checkout', label: 'Thanh toán', index: 2 },
  { key: 'success', label: 'Hoàn tất', index: 3 },
]

function getStepState(current: CheckoutStepKey, step: CheckoutStepKey): 'done' | 'current' | 'pending' {
  const currentIndex = STEPS.findIndex((item) => item.key === current)
  const stepIndex = STEPS.findIndex((item) => item.key === step)

  if (stepIndex < currentIndex) {
    return 'done'
  }

  if (stepIndex === currentIndex) {
    return 'current'
  }

  return 'pending'
}

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  return (
    <ol className="grid grid-cols-3 gap-2 md:gap-3">
      {STEPS.map((step) => {
        const state = getStepState(current, step.key)
        const circleClass =
          state === 'current'
            ? 'border-[#f15a24] bg-[#f15a24] text-white'
            : state === 'done'
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-300 bg-white text-neutral-500'
        const labelClass = state === 'current' ? 'text-neutral-900' : 'text-neutral-500'

        return (
          <li key={step.key} className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2">
            <span
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${circleClass}`}
            >
              {step.index}
            </span>
            <span className={`truncate text-[11px] font-semibold uppercase tracking-[0.08em] md:text-xs ${labelClass}`}>
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
