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

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-500">Search</p>
        <h1 className="text-3xl font-semibold tracking-[0]">상품 검색</h1>
      </div>

      <form
        className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_160px_160px_auto]"
        onSubmit={handleSubmit}
      >
        <Input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="Search keyword"
          required
        />
        <Select
          value={type}
          onChange={(event) => setType(event.target.value as ProductSearchType)}
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

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-100 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Release</th>
            </tr>
          </thead>
          <tbody>
            {!keyword && (
              <tr>
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={6}>
                  검색어를 입력해 주세요.
                </td>
              </tr>
            )}
            {productsQuery.isLoading && (
              <tr>
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={6}>
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
                    <Link to={`/products/${product.productId}`}>
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
                <td className="px-4 py-3">
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
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={6}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
