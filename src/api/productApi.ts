import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import {
  createMockProductDetail,
  mockProducts,
} from "@/data/mockProducts"
import type { ApiResponse } from "@/types/api"
import type {
  CreateProductRequest,
  GetProductsParams,
  ProductDetail,
  ProductImageUpload,
  ProductSaleType,
  SellerProduct,
  ProductSummary,
  UploadedProductImage,
  UploadFileType,
} from "@/types/product"

type PresignedUrlsResponse = {
  presignedUrls: Array<{
    sortOrder: number
    presignedUrl: string
  }>
}

type MockSellerProduct = SellerProduct & {
  detail: ProductDetail
  saleType: ProductSaleType
}

const mockSellerProducts: MockSellerProduct[] = []

export async function getProducts(params?: GetProductsParams) {
  if (USE_MOCKS) {
    const createdProducts: ProductSummary[] = mockSellerProducts.map(
      (product) => ({
        id: product.id,
        saleType: product.saleType,
        status: product.status,
        category: product.detail.category,
        url: product.url,
        name: product.name,
        brand: product.brand,
        price: product.price,
        viewCount: product.viewCount,
      })
    )

    return applyProductListOptions([...mockProducts, ...createdProducts], params)
  }

  const requestParams = {
    saleType: params?.saleType,
    status: params?.status,
    createdAt: params?.createdAt,
    category: params?.category,
  }
  const { data } = await apiClient.get<ApiResponse<ProductSummary[]>>(
    "/api/products",
    { params: requestParams }
  )

  return applyProductListOptions(unwrapData(data), params)
}

export async function getProductDetail(
  productId: number,
  saleType?: ProductSaleType
) {
  if (USE_MOCKS) {
    const createdProduct = mockSellerProducts.find(
      (product) => product.id === productId
    )

    if (createdProduct) {
      return createdProduct.detail
    }

    const product = createMockProductDetail(productId)

    if (!product) {
      throw new Error("존재하지 않는 상품입니다.")
    }

    return product
  }

  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(
    `/api/products/${productId}`
  )
  const product = unwrapData(data)
  const resolvedSaleType =
    product.saleType ?? saleType ?? (await findProductSaleType(productId))

  return {
    ...product,
    productId,
    saleType: resolvedSaleType,
  }
}

export async function getMySellerProducts(): Promise<SellerProduct[]> {
  if (USE_MOCKS) {
    return mockSellerProducts
  }

  const { data } = await apiClient.get<ApiResponse<SellerProduct[]>>(
    "/api/products/me"
  )
  const sellerProducts = unwrapData(data)

  if (sellerProducts.every((product) => product.saleType)) {
    return sellerProducts
  }

  try {
    const products = await getProducts()
    const saleTypeByProductId = new Map(
      products.map((product) => [product.id, product.saleType])
    )

    return sellerProducts.map((product) => ({
      ...product,
      saleType: product.saleType ?? saleTypeByProductId.get(product.id),
    }))
  } catch {
    return sellerProducts
  }
}

export async function deleteProduct(productId: number) {
  if (USE_MOCKS) {
    const productIndex = mockSellerProducts.findIndex(
      (product) => product.id === productId
    )

    if (productIndex >= 0) {
      mockSellerProducts.splice(productIndex, 1)
    }
    return
  }

  await apiClient.delete<ApiResponse<void>>(`/api/products/${productId}`)
}

export async function uploadProductImages(
  images: ProductImageUpload[]
): Promise<UploadedProductImage[]> {
  if (USE_MOCKS) {
    return images.map(({ sortOrder, file }) => ({
      sortOrder,
      url: URL.createObjectURL(file),
    }))
  }

  const files = images.map(({ sortOrder, file }) => ({
    sortOrder,
    uploadFileType: getUploadFileType(file),
  }))
  const { data } = await apiClient.post<ApiResponse<PresignedUrlsResponse>>(
    "/api/products/images/presigned-urls",
    { files }
  )
  const { presignedUrls } = unwrapData(data)

  return Promise.all(
    images.map(async ({ sortOrder, file }) => {
      const uploadTarget = presignedUrls.find(
        (item) => item.sortOrder === sortOrder
      )

      if (!uploadTarget) {
        throw new Error(`${sortOrder}번 이미지 업로드 주소가 없습니다.`)
      }

      const response = await fetch(uploadTarget.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": getUploadContentType(file),
        },
        body: file,
      })

      if (!response.ok) {
        throw new Error(`${sortOrder}번 이미지를 업로드하지 못했습니다.`)
      }

      return {
        sortOrder,
        url: uploadTarget.presignedUrl.split("?")[0],
      }
    })
  )
}

export async function createProduct(request: CreateProductRequest) {
  if (USE_MOCKS) {
    const id = Date.now()
    const insertedAt = new Date().toISOString()
    const firstImage = request.productImageContents[0]
    const detail: ProductDetail = {
      productId: id,
      saleType: request.saleType,
      sellerId: 1,
      images: request.productImageContents.map((image) => ({
        sortOrder: image.sortOrder,
        url: image.url,
        story: image.story ?? "",
      })),
      name: request.name,
      brand: request.brand,
      price: request.price,
      modelNumber: request.modelNumber,
      category: request.category,
      releaseDate: request.releaseDate,
      viewCount: 0,
      description: request.description,
      insertedAt,
    }

    mockSellerProducts.unshift({
      id,
      status: "PREPARING",
      url: firstImage.url,
      name: request.name,
      brand: request.brand,
      price: request.price,
      viewCount: 0,
      saleType: request.saleType,
      detail,
    })
    return
  }

  await apiClient.post<ApiResponse<void>>("/api/products", request)
}

function getUploadFileType(file: File): UploadFileType {
  const extension = file.name.split(".").pop()?.toUpperCase()

  if (
    extension === "JPG" ||
    extension === "JPEG" ||
    extension === "PNG" ||
    extension === "WEBP"
  ) {
    return extension
  }

  throw new Error("JPG, PNG, WEBP 형식의 이미지만 등록할 수 있습니다.")
}

function getUploadContentType(file: File) {
  const fileType = getUploadFileType(file)

  if (fileType === "PNG") {
    return "image/png"
  }

  if (fileType === "WEBP") {
    return "image/webp"
  }

  return "image/jpeg"
}

async function findProductSaleType(productId: number) {
  try {
    const products = await getProducts()
    return products.find((product) => product.id === productId)?.saleType
  } catch {
    return undefined
  }
}

function applyProductListOptions(
  products: ProductSummary[],
  params?: GetProductsParams
) {
  const filteredProducts = products.filter((product) => {
    const matchesSaleType =
      !params?.saleType || product.saleType === params.saleType
    const matchesStatus = !params?.status || product.status === params.status
    const matchesCategory =
      !params?.category ||
      !product.category ||
      product.category === params.category

    return matchesSaleType && matchesStatus && matchesCategory
  })

  return filteredProducts.sort((left, right) => {
    switch (params?.sort) {
      case "VIEW_COUNT":
        return right.viewCount - left.viewCount
      case "PRICE_ASC":
        return left.price - right.price
      case "PRICE_DESC":
        return right.price - left.price
      default:
        return 0
    }
  })
}
