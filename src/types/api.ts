export type ApiResponse<T> = {
  code: string
  message: string
  data: T
}

export type PageResponse<T> = {
  content: T[]
  number?: number
  empty?: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
