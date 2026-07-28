import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Eye, UserRound } from "lucide-react"
import { getProductDetail } from "@/api/productApi"
import { Button } from "@/components/ui/button"
import { formatDate, formatPrice } from "@/lib/format"

export function ProductDetailPage() {
  const { productId } = useParams()
  const parsedProductId = Number(productId)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const productQuery = useQuery({
    queryKey: ["product-detail", parsedProductId],
    queryFn: () => getProductDetail(parsedProductId),
    enabled: Number.isFinite(parsedProductId),
  })

  if (productQuery.isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
        상품 상세를 불러오는 중입니다.
      </div>
    )
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        상품 상세를 불러오지 못했습니다.
      </div>
    )
  }

  const product = productQuery.data
  const selectedImage = product.images[selectedImageIndex]

  return (
    <div className="grid min-h-[calc(100vh-104px)] grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" size="icon" aria-label="뒤로가기">
            <Link to="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-base font-semibold">{product.name}</h1>
            <p className="text-xs text-neutral-500">
              {product.brand} · {product.modelNumber}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button>즉시구매</Button>
          <Button variant="secondary">오퍼 작성</Button>
        </div>
      </div>

      <div className="grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-auto p-4">
          <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)]">
            <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:block lg:space-y-2 lg:overflow-visible">
              {product.images.map((image, index) => (
                <button
                  key={`${image.sortOrder}-${image.url}`}
                  className="size-20 shrink-0 overflow-hidden rounded-md border border-neutral-200 data-[selected=true]:border-neutral-950"
                  data-selected={index === selectedImageIndex}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${image.sortOrder}`}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="order-1 overflow-hidden rounded-lg bg-neutral-100 lg:order-2">
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-sm text-neutral-500">
                  이미지가 없습니다.
                </div>
              )}
            </div>
          </div>

          {selectedImage?.story && (
            <div className="mt-4 rounded-lg border border-neutral-200 p-4 text-sm leading-6 text-neutral-700">
              {selectedImage.story}
            </div>
          )}
        </div>

        <aside className="border-t border-neutral-200 bg-neutral-50 p-4 lg:border-l lg:border-t-0">
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs text-neutral-500">판매가</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatPrice(product.price)}원
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info label="카테고리" value={product.category} />
              <Info label="발매일" value={formatDate(product.releaseDate)} />
              <Info label="작성일" value={formatDate(product.insertedAt)} />
              <Info label="조회수" value={product.viewCount.toLocaleString()} />
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-3 text-sm text-neutral-700">
                <UserRound className="size-4" />
                판매자 {product.sellerId}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-neutral-700">
                <Eye className="size-4" />
                조회 {product.viewCount}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-sm font-semibold">상품 설명</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {product.description || "등록된 설명이 없습니다."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
