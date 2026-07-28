export type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
