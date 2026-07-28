import { apiClient } from "@/lib/apiClient"
import { mockProducts } from "@/data/mockProducts"
import type { ApiResponse, PageResponse } from "@/types/api"
import type { SearchProduct, SearchProductsParams } from "@/types/product"

const useMocks = import.meta.env.VITE_USE_MOCKS !== "false"

export async function searchProducts(params: SearchProductsParams) {
  if (useMocks) {
    const normalizedKeyword = params.keyword.trim().toLowerCase()
    const filteredProducts = mockProducts.filter((product) => {
      if (product.status !== "ON_SALE") {
        return false
      }

      if (params.type === "CATEGORY") {
        return (
          product.name.toLowerCase().includes(normalizedKeyword) ||
          "스니커즈".includes(normalizedKeyword)
        )
      }

      return (
        product.name.toLowerCase().includes(normalizedKeyword) ||
        product.brand.toLowerCase().includes(normalizedKeyword) ||
        (params.type === "STORY_CONTENT" &&
          ["면접", "여행", "운동", "이야기"].some((word) =>
            word.includes(normalizedKeyword)
          ))
      )
    })

    const content: SearchProduct[] = filteredProducts.map((product) => ({
      productId: product.id,
      productName: product.name,
      modelNumber: `DEAR-${String(product.id).padStart(4, "0")}`,
      category: "SNEAKERS",
      releaseDate: "2026-02-03",
      productPrice: product.price,
      saleType: product.saleType,
      viewCount: product.viewCount,
      description: "상품이 가진 이야기를 확인해 보세요.",
    }))

    return {
      content,
      number: 0,
      page: 1,
      size: params.size ?? 20,
      totalElements: content.length,
      totalPages: content.length > 0 ? 1 : 0,
      first: true,
      last: true,
      empty: content.length === 0,
    }
  }

  const { data } = await apiClient.get<ApiResponse<PageResponse<SearchProduct>>>(
    "/api/search/products",
    { params }
  )

  return data.data
}
