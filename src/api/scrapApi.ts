import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { mockProducts } from "@/data/mockProducts"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type { Scrap, ScrapPage } from "@/types/scrap"

export async function addScrap(productId: number) {
  if (USE_MOCKS) {
    return { productId }
  }

  const { data } = await apiClient.post<ApiResponse<Scrap>>(
    `/api/scraps/${productId}`
  )
  return unwrapData(data)
}

export async function deleteScrap(productId: number) {
  if (!USE_MOCKS) {
    await apiClient.delete<ApiResponse<void>>(`/api/scraps/${productId}`)
  }
}

export async function getScraps(page = 0, size = 10) {
  if (USE_MOCKS) {
    const scrapList = mockProducts.slice(0, 3).map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.url,
      status: product.status,
    }))

    return {
      scrapList,
      page,
      size,
      totalElements: scrapList.length,
      totalPages: 1,
      hasNext: false,
    }
  }

  const { data } = await apiClient.get<ApiResponse<ScrapPage>>("/api/scraps", {
    params: { page, size },
  })
  return unwrapData(data)
}
