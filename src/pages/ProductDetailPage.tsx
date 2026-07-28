import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Eye, UserRound } from "lucide-react"
import { getProductDetail } from "@/api/productApi"
import { Button } from "@/components/ui/button"
import { formatDate, formatPrice } from "@/lib/format"

export function ProductDetailPage() {
  const { productId } = useParams()
  const parsedProductId = Number(productId)

  const productQuery = useQuery({
    queryKey: ["product-detail", parsedProductId],
    queryFn: () => getProductDetail(parsedProductId),
    enabled: Number.isFinite(parsedProductId),
  })

  if (productQuery.isLoading) {
    return <div className="text-sm text-neutral-500">상품 상세를 불러오는 중입니다.</div>
  }

  if (productQuery.isError || !productQuery.data) {
    return <div className="text-sm text-red-600">상품 상세를 불러오지 못했습니다.</div>
  }

  const product = productQuery.data
  const mainImage = product.images[0]

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-neutral-500">
              이미지가 없습니다.
            </div>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {product.images.map((image) => (
            <div
              key={`${image.sortOrder}-${image.url}`}
              className="rounded-lg border border-neutral-200 bg-white p-3"
            >
              <img
                src={image.url}
                alt={`${product.name} ${image.sortOrder}`}
                className="aspect-video w-full rounded-md object-cover"
              />
              <p className="mt-3 text-sm text-neutral-600">{image.story}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">{product.brand}</p>
          <h1 className="text-3xl font-semibold tracking-[0]">{product.name}</h1>
          <p className="text-2xl font-semibold">{formatPrice(product.price)}원</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="모델번호" value={product.modelNumber} />
          <Info label="카테고리" value={product.category} />
          <Info label="발매일" value={formatDate(product.releaseDate)} />
          <Info label="작성일" value={formatDate(product.insertedAt)} />
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4" />
            판매자 {product.sellerId}
          </span>
          <span className="inline-flex items-center gap-2">
            <Eye className="size-4" />
            조회 {product.viewCount}
          </span>
        </div>

        <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="font-semibold">상품 설명</h2>
          <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
            {product.description || "등록된 설명이 없습니다."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button>즉시구매</Button>
          <Button variant="secondary">오퍼 작성</Button>
        </div>
      </div>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
