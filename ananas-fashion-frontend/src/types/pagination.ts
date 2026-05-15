export type PaginationMeta = {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type PaginatedResult<T> = {
  data: T[]
  meta: PaginationMeta
}
