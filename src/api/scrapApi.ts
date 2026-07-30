import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { mockProducts } from "@/data/mockProducts"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type { Scrap, ScrapPage } from "@/types/scrap"

const mockScrapIds = new Set(mockProducts.slice(0, 3).map((product) => product.id))

export async function addScrap(productId: number) {
  if (USE_MOCKS) {
    mockScrapIds.add(productId)
    return { productId }
  }

  const { data } = await apiClient.post<ApiResponse<Scrap>>(
    `/api/scraps/${productId}`
  )
  return unwrapData(data)
}

export async function deleteScrap(productId: number) {
  if (USE_MOCKS) {
    mockScrapIds.delete(productId)
    return
  }

  await apiClient.delete<ApiResponse<void>>(`/api/scraps/${productId}`)
}

export async function getScraps(page = 0, size = 10) {
  if (USE_MOCKS) {
    const allScraps = mockProducts
      .filter((product) => mockScrapIds.has(product.id))
      .map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        imageUrl: product.url,
        status: product.status,
      }))
    const start = page * size
    const scrapList = allScraps.slice(start, start + size)

    return {
      scrapList,
      page,
      size,
      totalElements: allScraps.length,
      totalPages: Math.ceil(allScraps.length / size),
      hasNext: start + size < allScraps.length,
    }
  }

  const { data } = await apiClient.get<ApiResponse<ScrapPage>>("/api/scraps", {
    params: { page, size },
  })
  return unwrapData(data)
}
