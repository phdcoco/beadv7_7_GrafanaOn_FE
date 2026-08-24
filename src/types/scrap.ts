import type { PageResponse } from "@/types/api"

export type Scrap = {
  productId: number
}

export type ScrapListItem = {
  id: number
  name: string
  brand: string
  price: number
  imageUrl: string
  status: string
}

export type ScrapPage = PageResponse<ScrapListItem>
