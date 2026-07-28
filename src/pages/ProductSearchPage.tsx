import { FormEvent, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { searchProducts } from "@/api/searchApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { formatDate, formatPrice } from "@/lib/format"
import type { ProductSearchSort, ProductSearchType } from "@/types/product"

const searchTypes: { value: ProductSearchType; label: string }[] = [
  { value: "PRODUCT_NAME", label: "상품명" },
  { value: "CATEGORY", label: "카테고리" },
  { value: "STORY_CONTENT", label: "스토리" },
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

  const resultCount = productsQuery.data?.totalElements ?? 0

  return (
    <div className="grid min-h-[calc(100vh-104px)] grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <form
        className="grid gap-2 border-b border-neutral-200 p-4 lg:grid-cols-[1fr_160px_160px_auto]"
        onSubmit={handleSubmit}
      >
        <Input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="검색어"
          required
        />
        <Select
          value={type}
          onChange={(event) => setType(event.target.value as ProductSearchType)}
          aria-label="검색 타입"
        >
          {searchTypes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value as ProductSearchSort)}
          aria-label="정렬"
        >
          {searchSorts.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Button>
          <Search className="size-4" />
          검색
        </Button>
      </form>

      <div className="overflow-auto">
        <div className="flex h-11 items-center justify-between border-b border-neutral-100 px-4 text-xs text-neutral-500">
          <span>{keyword ? `"${keyword}" 결과 ${resultCount}개` : "검색 대기"}</span>
          <span>page 1 / size 20</span>
        </div>

        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">상품명</th>
              <th className="px-4 py-3 font-medium">모델번호</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">가격</th>
              <th className="px-4 py-3 font-medium">조회수</th>
              <th className="px-4 py-3 font-medium">발매일</th>
            </tr>
          </thead>
          <tbody>
            {!keyword && (
              <tr>
                <td className="px-4 py-12 text-center text-neutral-500" colSpan={6}>
                  검색어를 입력해 주세요.
                </td>
              </tr>
            )}
            {productsQuery.isLoading && (
              <tr>
                <td className="px-4 py-12 text-center text-neutral-500" colSpan={6}>
                  검색 중입니다.
                </td>
              </tr>
            )}
            {productsQuery.data?.content.map((product) => (
              <tr
                key={`${product.productId ?? product.modelNumber}-${product.productName}`}
                className="border-t border-neutral-100"
              >
                <td className="px-4 py-3 font-medium">
                  {product.productId ? (
                    <Link to={`/products/${product.productId}`} className="hover:underline">
                      {product.productName}
                    </Link>
                  ) : (
                    product.productName
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {product.modelNumber}
                </td>
                <td className="px-4 py-3 text-neutral-600">{product.category}</td>
                <td className="px-4 py-3 font-medium">
                  {formatPrice(product.productPrice)}원
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {product.viewCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {formatDate(product.releaseDate)}
                </td>
              </tr>
            ))}
            {productsQuery.data?.content.length === 0 && (
              <tr>
                <td className="px-4 py-12 text-center text-neutral-500" colSpan={6}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
