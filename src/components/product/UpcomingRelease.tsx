import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarClock, LockKeyhole } from "lucide-react"
import { getProductsPage } from "@/api/productApi"
import { PaginationNav } from "@/components/ui/PaginationNav"
import {
  formatReleaseDate,
  getNextReleaseAt,
  getReleaseCountdown,
} from "@/lib/releaseSchedule"
import type { ProductSaleType, ProductSummary } from "@/types/product"

const upcomingGroups: { saleType: ProductSaleType; label: string }[] = [
  { saleType: "IMMEDIATE", label: "즉시구매" },
  { saleType: "OFFER", label: "오퍼구매" },
]
const UPCOMING_PAGE_SIZE = 12

export function UpcomingRelease() {
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => new Date())
  const [releaseAt, setReleaseAt] = useState(() => getNextReleaseAt())
  const [page, setPage] = useState(1)
  const productsQuery = useQuery({
    queryKey: ["products", "PREPARING", "upcoming", page],
    queryFn: () =>
      getProductsPage({
        status: "PREPARING",
        page,
        size: UPCOMING_PAGE_SIZE,
      }),
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = new Date()

      if (current.getTime() >= releaseAt.getTime()) {
        void queryClient.invalidateQueries({ queryKey: ["products"] })
        void queryClient.invalidateQueries({ queryKey: ["search-products"] })
        setPage(1)
        setReleaseAt(getNextReleaseAt(current))
      }

      setNow(current)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [queryClient, releaseAt])

  const countdown = getReleaseCountdown(now, releaseAt)
  const products = productsQuery.data?.content ?? []
  const totalProducts = productsQuery.data?.pagination.totalItems ?? 0

  return (
    <div>
      <section className="bg-neutral-950 px-5 py-7 text-white md:px-8 md:py-9">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand">
              <CalendarClock className="size-4" />
              매일 오후 8시 공개
            </div>
            <h1 className="mt-3 text-2xl font-black leading-8">
              아직 공개되지 않은
              <br />
              새로운 상품이 있어요
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              {formatReleaseDate(releaseAt)}에{" "}
              {productsQuery.isLoading ? "새 상품" : `${totalProducts}개 상품`}이
              한꺼번에 열립니다.
            </p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-brand/20 text-brand">
            <LockKeyhole className="size-6" />
          </span>
        </div>

        <div className="mt-7">
          <p className="mb-2 text-xs font-semibold text-neutral-400">
            다음 공개까지
          </p>
          <div className="grid max-w-sm grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
            <TimeUnit value={countdown.hours} label="시간" />
            <span className="pb-5 text-xl font-black text-neutral-600">:</span>
            <TimeUnit value={countdown.minutes} label="분" />
            <span className="pb-5 text-xl font-black text-neutral-600">:</span>
            <TimeUnit value={countdown.seconds} label="초" />
          </div>
        </div>
      </section>

      <div className="border-b border-neutral-100 bg-[#f7f7f5] px-5 py-4 md:px-8">
        <p className="flex items-start gap-2 text-xs leading-5 text-neutral-600">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
          공개 전에는 상품명과 흐리게 표시된 대표 사진만 확인할 수 있어요.
          가격, 설명과 상세 정보는 오후 8시에 공개됩니다.
        </p>
      </div>

      <div className="space-y-9 px-5 py-7 md:px-8">
        {productsQuery.isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <UpcomingSkeleton key={index} />
            ))}
          </div>
        )}

        {productsQuery.isError && (
          <p className="py-8 text-center text-sm text-neutral-500">
            공개 예정 상품을 불러오지 못했습니다.
          </p>
        )}

        {!productsQuery.isLoading &&
          !productsQuery.isError &&
          products.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-500">
              다음 공개를 준비 중입니다.
            </p>
          )}

        {upcomingGroups.map((group) => {
          const groupProducts = products.filter(
            (product) => product.saleType === group.saleType
          )

          if (groupProducts.length === 0) {
            return null
          }

          return (
            <section key={group.saleType}>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-lg font-extrabold">{group.label}</h2>
                <span className="text-xs font-semibold text-neutral-400">
                  현재 페이지 {groupProducts.length}개
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {groupProducts.map((product) => (
                  <UpcomingProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )
        })}

        {productsQuery.data && (
          <PaginationNav
            pagination={productsQuery.data.pagination}
            label="공개 예정 상품 페이지"
            onPageChange={(nextPage) => {
              setPage(nextPage)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        )}
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex h-14 items-center justify-center rounded-md bg-white text-2xl font-black tabular-nums text-neutral-950">
        {String(value).padStart(2, "0")}
      </div>
      <p className="mt-1 text-center text-[10px] font-semibold text-neutral-500">
        {label}
      </p>
    </div>
  )
}

function UpcomingProductCard({ product }: { product: ProductSummary }) {
  return (
    <article>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200">
        <img
          src={product.url}
          alt=""
          className="h-full w-full scale-105 object-cover grayscale opacity-55 blur-[2px]"
        />
        <div className="absolute inset-0 bg-neutral-500/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <LockKeyhole className="size-4 text-neutral-700" />
          </span>
          <p className="mt-3 text-xs font-bold text-neutral-700">공개 전</p>
        </div>
        <span className="absolute left-2 top-2 rounded bg-neutral-950/75 px-1.5 py-1 text-[10px] font-semibold text-white">
          {product.saleType === "IMMEDIATE" ? "즉시구매" : "오퍼구매"}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-neutral-900">
        {product.name}
      </p>
      <p className="mt-1 text-xs font-medium text-neutral-500">
        상세 정보는 오후 8시 공개
      </p>
    </article>
  )
}

function UpcomingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-lg bg-neutral-200" />
      <div className="mt-2 h-4 w-4/5 bg-neutral-100" />
      <div className="mt-2 h-3 w-2/3 bg-neutral-100" />
    </div>
  )
}
