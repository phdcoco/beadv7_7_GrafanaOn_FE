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

export type ScrapPage = {
  scrapList: ScrapListItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}
