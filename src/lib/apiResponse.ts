import type { ApiResponse } from "@/types/api"

export function unwrapData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined || response.data === null) {
    throw new Error("응답 데이터가 없습니다.")
  }

  return response.data
}
