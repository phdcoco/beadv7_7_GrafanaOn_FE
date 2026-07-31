import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import { mockProducts } from "@/data/mockProducts"
import { getProducts } from "@/api/productApi"
import type { ApiResponse, PageResponse } from "@/types/api"
import type {
  ProductCategory,
  ProductListSort,
  ProductSummary,
  SearchProduct,
  SearchProductsParams,
} from "@/types/product"

const categoryAliases: Array<{
  value: ProductCategory
  aliases: string[]
}> = [
  { value: "SNEAKERS", aliases: ["SNEAKERS", "스니커즈"] },
  { value: "SPORTS_SHOES", aliases: ["SPORTS_SHOES", "스포츠화"] },
  { value: "DRESS_SHOES", aliases: ["DRESS_SHOES", "구두"] },
  { value: "BOOTS", aliases: ["BOOTS", "부츠", "워커", "부츠/워커"] },
  {
    value: "SANDALS_SLIDES",
    aliases: ["SANDALS_SLIDES", "샌들", "슬리퍼", "샌들/슬리퍼"],
  },
  {
    value: "WINTER_SHOES",
    aliases: ["WINTER_SHOES", "패딩", "퍼 신발", "패딩/퍼 신발"],
  },
]

export async function searchProducts(params: SearchProductsParams) {
  if (USE_MOCKS) {
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
      brand: product.brand,
      imageUrl: product.url,
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

  if (params.type !== "STORY_CONTENT") {
    return searchCurrentProducts(params)
  }

  const { data } = await apiClient.get<ApiResponse<PageResponse<SearchProduct>>>(
    "/api/search/products",
    { params }
  )

  const searchPage = unwrapData(data)
  const currentProducts = await getProducts()
  const currentProductByKey = new Map(
    currentProducts.map((product) => [getProductKey(product), product])
  )
  const content = searchPage.content.flatMap((product) => {
    const currentProduct = currentProductByKey.get(getSearchProductKey(product))

    if (!currentProduct || currentProduct.status === "SOLD_OUT") {
      return []
    }

    return [toSearchProduct(currentProduct, product)]
  })

  return {
    ...searchPage,
    content,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
  }
}

async function searchCurrentProducts(params: SearchProductsParams) {
  const category =
    params.type === "CATEGORY" ? resolveCategory(params.keyword) : undefined

  if (params.type === "CATEGORY" && !category) {
    return emptySearchPage(params)
  }

  const products = await getProducts({
    category,
    sort: toProductListSort(params.sort),
  })
  const normalizedKeyword = normalize(params.keyword)
  const matchedProducts = products.filter((product) => {
    if (product.status === "SOLD_OUT") {
      return false
    }

    if (params.type === "CATEGORY") {
      return true
    }

    return (
      normalize(product.name).includes(normalizedKeyword) ||
      normalize(product.brand).includes(normalizedKeyword)
    )
  })

  if (!params.sort || params.sort === "LATEST") {
    matchedProducts.sort((left, right) => right.id - left.id)
  }

  const page = params.page ?? 1
  const size = params.size ?? 20
  const start = (page - 1) * size
  const content = matchedProducts
    .slice(start, start + size)
    .map((product) => toSearchProduct(product, undefined, category))
  const totalPages = Math.ceil(matchedProducts.length / size)

  return {
    content,
    page,
    size,
    totalElements: matchedProducts.length,
    totalPages,
    first: page === 1,
    last: totalPages === 0 || page >= totalPages,
  }
}

function toSearchProduct(
  product: ProductSummary,
  indexedProduct?: SearchProduct,
  category?: ProductCategory
): SearchProduct {
  return {
    productId: product.id,
    productName: product.name,
    modelNumber: indexedProduct?.modelNumber ?? "",
    category: indexedProduct?.category ?? product.category ?? category ?? "",
    releaseDate: indexedProduct?.releaseDate ?? null,
    productPrice: product.price,
    saleType: product.saleType,
    viewCount: product.viewCount,
    description: indexedProduct?.description ?? null,
    brand: product.brand,
    imageUrl: product.url,
  }
}

function resolveCategory(keyword: string) {
  const normalizedKeyword = normalize(keyword)

  return categoryAliases.find(({ aliases }) =>
    aliases.some((alias) => normalize(alias) === normalizedKeyword)
  )?.value
}

function toProductListSort(
  sort?: SearchProductsParams["sort"]
): ProductListSort | undefined {
  if (sort === "VIEW_COUNT" || sort === "PRICE_ASC" || sort === "PRICE_DESC") {
    return sort
  }

  return undefined
}

function emptySearchPage(params: SearchProductsParams) {
  return {
    content: [],
    page: params.page ?? 1,
    size: params.size ?? 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  }
}

function getProductKey(product: ProductSummary) {
  return `${product.name}|${product.saleType}|${Number(product.price)}`
}

function getSearchProductKey(product: SearchProduct) {
  return `${product.productName}|${product.saleType}|${Number(
    product.productPrice
  )}`
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[\s/_-]/g, "")
}
