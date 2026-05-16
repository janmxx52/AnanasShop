import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

type ShowToastOptions = {
  message: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void
  success: (message: string, durationMs?: number) => void
  error: (message: string, durationMs?: number) => void
  info: (message: string, durationMs?: number) => void
}

const DEFAULT_DURATION_MS = 3200
const MAX_TOASTS = 4

const variantClassNames: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-slate-200 bg-slate-50 text-slate-700',
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

type ToastProviderProps = {
  children: ReactNode
}

function generateToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((toastId: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== toastId))
  }, [])

  const showToast = useCallback(
    ({ message, variant = 'info', durationMs = DEFAULT_DURATION_MS }: ShowToastOptions) => {
      const trimmedMessage = message.trim()
      if (!trimmedMessage) {
        return
      }

      const toastId = generateToastId()

      setToasts((previous) => {
        const next = [...previous, { id: toastId, message: trimmedMessage, variant }]
        return next.slice(-MAX_TOASTS)
      })

      window.setTimeout(() => {
        removeToast(toastId)
      }, durationMs)
    },
    [removeToast],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message: string, durationMs?: number) =>
        showToast({ message, variant: 'success', durationMs }),
      error: (message: string, durationMs?: number) =>
        showToast({ message, variant: 'error', durationMs }),
      info: (message: string, durationMs?: number) =>
        showToast({ message, variant: 'info', durationMs }),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded border px-3 py-2 text-sm shadow ${variantClassNames[toast.variant]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
