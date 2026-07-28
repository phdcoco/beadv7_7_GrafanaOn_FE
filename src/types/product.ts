export type ProductSearchSort = "LATEST" | "VIEW_COUNT" | "PRICE_ASC" | "PRICE_DESC"

export type ProductSearchType = "PRODUCT_NAME" | "CATEGORY" | "STORY_CONTENT"

export type ProductSaleType = "IMMEDIATE" | "OFFER"

export type ProductStatus = "PREPARING" | "ON_SALE" | "SOLD_OUT"

export type ProductSummary = {
  id: number
  saleType: ProductSaleType
  status: ProductStatus
  url: string
  name: string
  brand: string
  price: number
  viewCount: number
}

export type ProductImage = {
  sortOrder: number
  url: string
  story: string
}

export type ProductDetail = {
  sellerId: number
  images: ProductImage[]
  name: string
  brand: string
  price: number
  modelNumber: string
  category: string
  releaseDate: string | null
  viewCount: number
  description: string | null
  insertedAt: string
}

export type SearchProduct = {
  productId?: number
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
  type?: ProductSearchType
}

export type GetProductsParams = {
  saleType?: ProductSaleType
  status?: ProductStatus
}
