export type ApiResponse<T> = {
  code: string
  message: string
  data?: T
}

export type PaginationInfo = {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export type PageResponse<T> = {
  content: T[]
  pagination: PaginationInfo
}
