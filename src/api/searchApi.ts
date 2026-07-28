import { apiClient } from "@/lib/apiClient"
import type { ApiResponse, PageResponse } from "@/types/api"
import type { SearchProduct, SearchProductsParams } from "@/types/product"

export async function searchProducts(params: SearchProductsParams) {
  const { data } = await apiClient.get<ApiResponse<PageResponse<SearchProduct>>>(
    "/api/search/products",
    { params }
  )

  return data.data
}
