import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import {
  createMockProductDetail,
  mockProducts,
} from "@/data/mockProducts"
import type { ApiResponse } from "@/types/api"
import type {
  GetProductsParams,
  ProductDetail,
  ProductSaleType,
  ProductSummary,
} from "@/types/product"

export async function getProducts(params?: GetProductsParams) {
  if (USE_MOCKS) {
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

  return unwrapData(data)
}

export async function getProductDetail(
  productId: number,
  saleType?: ProductSaleType
) {
  if (USE_MOCKS) {
    const product = createMockProductDetail(productId)

    if (!product) {
      throw new Error("존재하지 않는 상품입니다.")
    }

    return product
  }

  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(
    `/api/products/${productId}`
  )

  return {
    ...unwrapData(data),
    productId,
    saleType,
  }
}
