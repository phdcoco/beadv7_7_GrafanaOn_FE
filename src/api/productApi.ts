import { apiClient } from "@/lib/apiClient"
import type { ApiResponse } from "@/types/api"
import type {
  GetProductsParams,
  ProductDetail,
  ProductSummary,
} from "@/types/product"

export async function getProducts(params?: GetProductsParams) {
  const { data } = await apiClient.get<ApiResponse<ProductSummary[]>>(
    "/api/products",
    { params }
  )

  return data.data
}

export async function getProductDetail(productId: number) {
  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(
    `/api/products/${productId}`
  )

  return data.data
}
