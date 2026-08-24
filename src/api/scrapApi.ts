import { apiClient } from "@/lib/apiClient"
import {
  createPageResponse,
  normalizePageResponse,
  unwrapData,
} from "@/lib/apiResponse"
import { mockProducts } from "@/data/mockProducts"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse, PageResponse } from "@/types/api"
import type { Scrap, ScrapListItem, ScrapPage } from "@/types/scrap"

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

export async function getScraps(page = 1, size = 10): Promise<ScrapPage> {
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
    const start = (page - 1) * size
    return createPageResponse(
      allScraps.slice(start, start + size),
      page,
      size,
      allScraps.length
    )
  }

  const { data } = await apiClient.get<ApiResponse<PageResponse<ScrapListItem>>>(
    "/api/scraps",
    { params: { page, size } }
  )
  return normalizePageResponse(unwrapData(data))
}

export async function getAllScraps() {
  const firstPage = await getScraps(1, 20)
  const scraps = [...firstPage.content]
  let currentPage = firstPage

  while (
    currentPage.pagination.hasNext &&
    currentPage.pagination.currentPage < 50
  ) {
    currentPage = await getScraps(
      currentPage.pagination.currentPage + 1,
      20
    )
    scraps.push(...currentPage.content)
  }

  return scraps
}
