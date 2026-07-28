import { useRef, useState, type UIEvent } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircleMore,
  Share2,
  ShoppingBag,
} from "lucide-react"
import { getProductDetail } from "@/api/productApi"
import { formatDate, formatPrice } from "@/lib/format"
import type { ProductSaleType } from "@/types/product"

const categoryLabels: Record<string, string> = {
  SNEAKERS: "스니커즈",
  SPORTS_SHOES: "스포츠화",
  DRESS_SHOES: "구두",
  BOOTS: "부츠/워커",
  SANDALS_SLIDES: "샌들/슬리퍼",
  WINTER_SHOES: "패딩/퍼 신발",
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const parsedProductId = Number(productId)
  const [activeIndex, setActiveIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const productQuery = useQuery({
    queryKey: ["product-detail", parsedProductId],
    queryFn: () => getProductDetail(parsedProductId),
    enabled: Number.isFinite(parsedProductId),
  })

  if (productQuery.isLoading) {
    return <DetailLoading />
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-semibold">상품 상세를 불러오지 못했습니다.</p>
        <Link to="/" className="text-sm text-neutral-500 underline">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  const product = productQuery.data
  const querySaleType = searchParams.get("saleType") as ProductSaleType | null
  const saleType = product.saleType ?? querySaleType ?? "IMMEDIATE"
  const isOffer = saleType === "OFFER"

  function handleSlide(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget
    const nextIndex = Math.round(target.scrollLeft / target.clientWidth)
    setActiveIndex(nextIndex)
  }

  function moveSlide(nextIndex: number) {
    const safeIndex = Math.max(0, Math.min(nextIndex, product.images.length - 1))
    sliderRef.current?.scrollTo({
      left: sliderRef.current.clientWidth * safeIndex,
      behavior: "smooth",
    })
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1180px] bg-white">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-100 bg-white/96 px-3 backdrop-blur md:px-6">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="뒤로가기"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </button>
        <p className="max-w-[60%] truncate text-sm font-bold">{product.name}</p>
        <div className="flex">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="상품 저장"
          >
            <Bookmark className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="공유"
          >
            <Share2 className="size-5" />
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="min-w-0 md:border-r md:border-neutral-200">
          <div className="relative bg-[#f5f5f3]">
            <div
              ref={sliderRef}
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
              onScroll={handleSlide}
            >
              {product.images.map((image, index) => (
                <article
                  key={`${image.sortOrder}-${image.url}`}
                  className="w-full shrink-0 snap-start"
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="aspect-[4/5] w-full object-cover sm:aspect-square"
                  />
                  {isOffer && (
                    <div className="min-h-36 border-t border-neutral-200 bg-white px-5 py-5 md:px-8">
                      <p className="text-xs font-bold text-[#5b72f2]">
                        이야기 {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {image.story}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-[40%] hidden size-10 items-center justify-center rounded-full bg-white/90 shadow-sm md:flex"
                  aria-label="이전 사진"
                  onClick={() => moveSlide(activeIndex - 1)}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-[40%] hidden size-10 items-center justify-center rounded-full bg-white/90 shadow-sm md:flex"
                  aria-label="다음 사진"
                  onClick={() => moveSlide(activeIndex + 1)}
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            <div className="absolute right-4 top-4 rounded-full bg-neutral-950/75 px-2.5 py-1 text-xs font-semibold text-white">
              {activeIndex + 1} / {product.images.length}
            </div>
          </div>

          <div className="flex justify-center gap-1.5 border-b border-neutral-100 bg-white py-3">
            {product.images.map((image, index) => (
              <button
                key={image.sortOrder}
                type="button"
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index
                    ? "w-6 bg-neutral-950"
                    : "w-1.5 bg-neutral-300"
                }`}
                aria-label={`${index + 1}번 사진 보기`}
                onClick={() => moveSlide(index)}
              />
            ))}
          </div>
        </div>

        <aside className="min-w-0 bg-white">
          <div className="border-b border-neutral-100 px-5 py-6 md:px-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-500">{product.brand}</p>
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Eye className="size-3.5" />
                {product.viewCount.toLocaleString()}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-extrabold leading-7">{product.name}</h1>
            <p className="mt-3 text-2xl font-black">
              {formatPrice(product.price)}원
            </p>
            <span
              className={`mt-4 inline-flex rounded px-2 py-1 text-xs font-bold ${
                isOffer
                  ? "bg-[#eef0ff] text-[#5b72f2]"
                  : "bg-[#fff0ee] text-[#df5549]"
              }`}
            >
              {isOffer ? "오퍼구매" : "즉시구매"}
            </span>
          </div>

          <div className="grid grid-cols-2 border-b border-neutral-100 px-5 py-5 text-sm md:px-7">
            <Info label="모델번호" value={product.modelNumber} />
            <Info
              label="카테고리"
              value={categoryLabels[product.category] ?? product.category}
            />
            <Info label="발매일" value={formatDate(product.releaseDate)} />
            <Info label="등록일" value={formatDate(product.insertedAt)} />
          </div>

          <div className="border-b border-neutral-100 px-5 py-5 md:px-7">
            <p className="text-sm font-extrabold">상품 설명</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
              {product.description || "등록된 상품 설명이 없습니다."}
            </p>
          </div>

          <div className="px-5 py-5 md:px-7">
            <p className="text-sm font-extrabold">판매자</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#55c7bd] text-sm font-bold text-white">
                D
              </span>
              <div>
                <p className="text-sm font-bold">D:EAR 회원 {product.sellerId}</p>
                <p className="mt-0.5 text-xs text-neutral-500">안전한 거래를 약속했어요</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-30 border-t border-neutral-200 bg-white/97 p-3 backdrop-blur">
        <div className="mx-auto grid max-w-[760px] grid-cols-[1fr_1.5fr] gap-2">
          {isOffer ? (
            <>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-md border border-neutral-300 text-sm font-bold"
              >
                <MessageCircleMore className="size-4" />
                오퍼 보기
              </button>
              <button
                type="button"
                className="h-12 rounded-md bg-[#5b72f2] text-sm font-bold text-white"
              >
                오퍼 작성하기
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-md border border-neutral-300 text-sm font-bold"
              >
                <ShoppingBag className="size-4" />
                장바구니
              </button>
              <button
                type="button"
                className="h-12 rounded-md bg-neutral-950 text-sm font-bold text-white"
              >
                즉시 구매하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 font-semibold text-neutral-700">{value}</p>
    </div>
  )
}

function DetailLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-white">
      <div className="h-14 border-b border-neutral-100" />
      <div className="grid md:grid-cols-2">
        <div className="aspect-[4/5] bg-neutral-100 sm:aspect-square" />
        <div className="space-y-4 p-6">
          <div className="h-3 w-20 bg-neutral-100" />
          <div className="h-7 w-3/4 bg-neutral-100" />
          <div className="h-8 w-40 bg-neutral-100" />
        </div>
      </div>
    </div>
  )
}
