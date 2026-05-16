type LoadingStateProps = {
  message?: string
}

export function LoadingState({ message = 'Đang tải...' }: LoadingStateProps) {
  return (
    <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-600">
      {message}
    </div>
  )
}
