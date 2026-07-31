import { mockProducts } from "@/data/mockProducts"
import { getProducts } from "@/api/productApi"
import { apiClient, ApiClientError } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type { Cart } from "@/types/cart"

const MOCK_CART_KEY = "dear-mock-cart-product-ids"

export async function getCart(): Promise<Cart> {
  if (USE_MOCKS) {
    return createMockCart()
  }

  try {
    const { data } = await apiClient.get<ApiResponse<Cart>>("/api/carts")
    return fillMissingThumbnailUrls(unwrapData(data))
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "CT-003") {
      return { cartId: null, items: [] }
    }

    throw error
  }
}

async function fillMissingThumbnailUrls(cart: Cart): Promise<Cart> {
  if (cart.items.every((item) => Boolean(item.thumbnailUrl))) {
    return cart
  }

  try {
    const products = await getProducts()
    const imageUrlByProductId = new Map(
      products.map((product) => [product.id, product.url])
    )

    return {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        thumbnailUrl:
          item.thumbnailUrl ?? imageUrlByProductId.get(item.productId) ?? null,
      })),
    }
  } catch {
    return cart
  }
}

export async function addCartItem(productId: number) {
  if (USE_MOCKS) {
    const productIds = readMockProductIds()

    if (!productIds.includes(productId)) {
      writeMockProductIds([...productIds, productId])
    }

    return
  }

  await apiClient.post<ApiResponse<void>>("/api/carts/items", { productId })
}

export async function deleteCartItems(productIds: number[]) {
  if (USE_MOCKS) {
    const deletedIds = new Set(productIds)
    writeMockProductIds(
      readMockProductIds().filter((productId) => !deletedIds.has(productId))
    )
    return
  }

  const searchParams = new URLSearchParams()
  productIds.forEach((productId) => {
    searchParams.append("productIds", String(productId))
  })

  await apiClient.delete<ApiResponse<void>>(
    `/api/carts/items?${searchParams.toString()}`
  )
}

export async function deleteAllCartItems() {
  if (USE_MOCKS) {
    writeMockProductIds([])
    return
  }

  await apiClient.delete<ApiResponse<void>>("/api/carts/items/all")
}

function createMockCart(): Cart {
  const items = readMockProductIds()
    .map((productId, index) => {
      const product = mockProducts.find(
        (item) =>
          item.id === productId &&
          item.saleType === "IMMEDIATE" &&
          item.status === "ON_SALE"
      )

      if (!product) {
        return null
      }

      return {
        cartItemId: index + 1,
        productId: product.id,
        productName: product.name,
        thumbnailUrl: product.url,
        productPrice: product.price,
        status: "BEFORE_PAYMENT",
      }
    })
    .filter((item) => item !== null)

  return {
    cartId: items.length > 0 ? 1 : null,
    items,
  }
}

function readMockProductIds(): number[] {
  try {
    const storedIds = JSON.parse(localStorage.getItem(MOCK_CART_KEY) ?? "[]")

    if (!Array.isArray(storedIds)) {
      return []
    }

    return storedIds.filter(
      (productId): productId is number =>
        typeof productId === "number" && Number.isFinite(productId)
    )
  } catch {
    return []
  }
}

function writeMockProductIds(productIds: number[]) {
  localStorage.setItem(MOCK_CART_KEY, JSON.stringify(productIds))
}
