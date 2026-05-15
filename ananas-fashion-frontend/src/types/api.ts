export type ApiMeta = {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type ApiSuccessEnvelope<T> = {
  success: true
  message: string
  data: T
}

export type ApiPaginatedEnvelope<T> = ApiSuccessEnvelope<T[]> & {
  meta: ApiMeta
}

export type ApiErrorEnvelope = {
  success: false
  message: string
  errors: Record<string, string[]> | null
}
