import { apiClient } from "@/lib/apiClient"
import {
  createMockProductDetail,
  mockProducts,
} from "@/data/mockProducts"
import type { ApiResponse } from "@/types/api"
import type {
  GetProductsParams,
  ProductDetail,
  ProductSummary,
} from "@/types/product"

const useMocks = import.meta.env.VITE_USE_MOCKS !== "false"

export async function getProducts(params?: GetProductsParams) {
  if (useMocks) {
    return mockProducts.filter((product) => {
      const matchesSaleType =
        !params?.saleType || product.saleType === params.saleType
      const matchesStatus = !params?.status || product.status === params.status

      return matchesSaleType && matchesStatus
    })
  }

  const { data } = await apiClient.get<ApiResponse<ProductSummary[]>>(
    "/api/products",
    { params }
  )

  return data.data
}

export async function getProductDetail(productId: number) {
  if (useMocks) {
    const product = createMockProductDetail(productId)

    if (!product) {
      throw new Error("존재하지 않는 상품입니다.")
    }

    return product
  }

  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(
    `/api/products/${productId}`
  )

  return data.data
}
