export type ProductSearchSort = "LATEST" | "VIEW_COUNT" | "PRICE_ASC" | "PRICE_DESC"

export type ProductSearchTarget = "PRODUCT_NAME" | "CATEGORY" | "STORY"

export type SearchProduct = {
  productId: number
  productName: string
  modelNumber: string
  category: string
  releaseDate: string | null
  productPrice: number
  saleType: string
  viewCount: number
  description: string | null
}

export type SearchProductsParams = {
  keyword: string
  page?: number
  size?: number
  sort?: ProductSearchSort
  target?: ProductSearchTarget
}
