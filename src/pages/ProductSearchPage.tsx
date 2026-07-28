import { FormEvent, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { searchProducts } from "@/api/searchApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { ProductSearchSort, ProductSearchTarget } from "@/types/product"

const searchTargets: { value: ProductSearchTarget; label: string }[] = [
  { value: "PRODUCT_NAME", label: "Product name" },
  { value: "CATEGORY", label: "Category" },
  { value: "STORY", label: "Story" },
]

const searchSorts: { value: ProductSearchSort; label: string }[] = [
  { value: "LATEST", label: "Latest" },
  { value: "VIEW_COUNT", label: "Most viewed" },
  { value: "PRICE_ASC", label: "Lowest price" },
  { value: "PRICE_DESC", label: "Highest price" },
]

export function ProductSearchPage() {
  const [keywordInput, setKeywordInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const [target, setTarget] = useState<ProductSearchTarget>("PRODUCT_NAME")
  const [sort, setSort] = useState<ProductSearchSort>("LATEST")

  const productsQuery = useQuery({
    queryKey: ["search-products", keyword, target, sort],
    queryFn: () =>
      searchProducts({
        keyword,
        target,
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
        <h1 className="text-3xl font-semibold tracking-[0]">Product search</h1>
        <p className="max-w-2xl text-sm text-neutral-600">
          Search products through the Gateway API. Product name is the default
          target, and category or story can be selected when needed.
        </p>
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
          value={target}
          onChange={(event) => setTarget(event.target.value as ProductSearchTarget)}
        >
          {searchTargets.map((item) => (
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
          Search
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
            </tr>
          </thead>
          <tbody>
            {!keyword && (
              <tr>
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={5}>
                  Enter a keyword to search.
                </td>
              </tr>
            )}
            {productsQuery.isLoading && (
              <tr>
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={5}>
                  Searching...
                </td>
              </tr>
            )}
            {productsQuery.data?.content.map((product) => (
              <tr key={product.productId} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{product.productName}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {product.modelNumber}
                </td>
                <td className="px-4 py-3 text-neutral-600">{product.category}</td>
                <td className="px-4 py-3">
                  {product.productPrice.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {product.viewCount.toLocaleString()}
                </td>
              </tr>
            ))}
            {productsQuery.data?.content.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-neutral-500" colSpan={5}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
