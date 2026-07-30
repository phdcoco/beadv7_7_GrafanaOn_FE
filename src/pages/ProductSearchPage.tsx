import { type FormEvent, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ImageOff, Search, SlidersHorizontal, X } from "lucide-react"
import { Link } from "react-router-dom"
import { searchProducts } from "@/api/searchApi"
import { mockProducts } from "@/data/mockProducts"
import { formatPrice } from "@/lib/format"
import { USE_MOCKS } from "@/lib/runtime"
import type { ProductSearchSort, ProductSearchType } from "@/types/product"

const searchTypes: { value: ProductSearchType; label: string }[] = [
  { value: "PRODUCT_NAME", label: "상품명" },
  { value: "CATEGORY", label: "카테고리" },
  { value: "STORY_CONTENT", label: "이야기" },
]

const searchSorts: { value: ProductSearchSort; label: string }[] = [
  { value: "LATEST", label: "최신순" },
  { value: "VIEW_COUNT", label: "조회수순" },
  { value: "PRICE_ASC", label: "낮은 가격순" },
  { value: "PRICE_DESC", label: "높은 가격순" },
]

export function ProductSearchPage() {
  const [keywordInput, setKeywordInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const [type, setType] = useState<ProductSearchType>("PRODUCT_NAME")
  const [sort, setSort] = useState<ProductSearchSort>("LATEST")

  const productsQuery = useQuery({
    queryKey: ["search-products", keyword, type, sort],
    queryFn: () =>
      searchProducts({
        keyword,
        type,
        sort,
        page: 1,
        size: 20,
      }),
    enabled: keyword.length > 0,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setKeyword(keywordInput.trim())
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="sticky top-16 z-20 border-b border-neutral-200 bg-white px-4 py-3 md:top-[72px] md:px-8">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-full md:hidden"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              className="h-11 w-full rounded-md bg-neutral-100 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-neutral-950"
              placeholder="상품명, 카테고리, 이야기를 검색하세요"
              autoFocus
            />
            {keywordInput && (
              <button
                type="button"
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full"
                aria-label="검색어 지우기"
                onClick={() => setKeywordInput("")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 rounded-md bg-brand px-4 text-sm font-bold text-neutral-950 hover:brightness-95"
          >
            검색
          </button>
        </form>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {searchTypes.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`h-9 shrink-0 rounded-full px-4 text-xs font-semibold ${
                type === item.value
                  ? "bg-brand text-neutral-950"
                  : "bg-neutral-100 text-neutral-600"
              }`}
              onClick={() => setType(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-12 items-center justify-between border-b border-neutral-100 px-5 text-xs md:px-8">
        <span className="text-neutral-500">
          {keyword
            ? `"${keyword}" 검색 결과 ${productsQuery.data?.totalElements ?? 0}개`
            : "찾고 싶은 상품을 검색해 보세요"}
        </span>
        <label className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="size-3.5" />
          <select
            value={sort}
            className="bg-transparent outline-none"
            onChange={(event) =>
              setSort(event.target.value as ProductSearchSort)
            }
          >
            {searchSorts.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!keyword && (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <Search className="size-8 text-neutral-300" />
          <p className="mt-4 text-sm font-bold">신발과 이야기를 찾아보세요</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            상품명 검색이 기본이며 카테고리와 이야기로도 검색할 수 있어요.
          </p>
        </div>
      )}

      {productsQuery.isLoading && (
        <div className="p-8 text-center text-sm text-neutral-500">검색 중입니다.</div>
      )}

      <div className="grid divide-y divide-neutral-100 md:grid-cols-2 md:divide-x md:divide-y-0">
        {productsQuery.data?.content.map((product) => {
          const image = USE_MOCKS
            ? mockProducts.find((item) => item.id === product.productId)?.url
            : undefined

          return (
            <Link
              key={`${product.productId ?? product.modelNumber}-${product.productName}`}
              to={
                product.productId
                  ? `/products/${product.productId}?saleType=${product.saleType}`
                  : "/search"
              }
              aria-disabled={!product.productId}
              onClick={(event) => {
                if (!product.productId) {
                  event.preventDefault()
                }
              }}
              className="grid grid-cols-[104px_1fr] gap-4 p-4 md:p-5"
            >
              <div className="overflow-hidden rounded-md bg-neutral-100">
                {image ? (
                  <img
                    src={image}
                    alt={product.productName}
                    className="aspect-square size-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-neutral-300">
                    <ImageOff className="size-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-400">{product.category}</p>
                <p className="mt-1 line-clamp-2 text-sm font-bold">
                  {product.productName}
                </p>
                <p className="mt-2 text-sm font-extrabold">
                  {formatPrice(product.productPrice)}원
                </p>
                <p className="mt-2 text-xs text-neutral-400">
                  {product.modelNumber} · 조회 {product.viewCount.toLocaleString()}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {productsQuery.data?.content.length === 0 && (
        <div className="p-12 text-center text-sm text-neutral-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  )
}
