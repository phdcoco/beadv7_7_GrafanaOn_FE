import type {
  ApiResponse,
  PageResponse,
  PaginationInfo,
} from "@/types/api"

export function unwrapData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined || response.data === null) {
    throw new Error("응답 데이터가 없습니다.")
  }

  return response.data
}

export function createPageResponse<T>(
  content: T[],
  currentPage: number,
  pageSize: number,
  totalItems = content.length
): PageResponse<T> {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)

  return {
    content,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      first: currentPage <= 1,
      last: totalPages === 0 || currentPage >= totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    },
  }
}

export function normalizePageResponse<T>(response: PageResponse<T>) {
  const pagination: PaginationInfo = response.pagination

  return {
    content: response.content ?? [],
    pagination,
  }
}
