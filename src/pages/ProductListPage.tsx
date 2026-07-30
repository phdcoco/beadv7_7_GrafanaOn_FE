import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { getProducts } from "@/api/productApi"
import { ProductCard } from "@/components/product/ProductCard"
import { StoryCard } from "@/components/product/StoryCard"
import { UpcomingRelease } from "@/components/product/UpcomingRelease"
import { offerStories } from "@/data/mockProducts"
import { USE_MOCKS } from "@/lib/runtime"

type HomeTab = "ALL" | "IMMEDIATE" | "OFFER" | "UPCOMING"

const tabs: { value: HomeTab; label: string }[] = [
  { value: "UPCOMING", label: "공개 예정" },
  { value: "ALL", label: "전체" },
  { value: "IMMEDIATE", label: "즉시구매" },
  { value: "OFFER", label: "오퍼구매" },
]

export function ProductListPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<HomeTab>("UPCOMING")

  const immediateProducts = useQuery({
    queryKey: ["products", "IMMEDIATE", "home"],
    queryFn: () =>
      getProducts({ saleType: "IMMEDIATE", status: "ON_SALE" }),
  })

  const offerProducts = useQuery({
    queryKey: ["products", "OFFER", "home"],
    queryFn: () => getProducts({ saleType: "OFFER", status: "ON_SALE" }),
  })

  const showImmediate = tab === "ALL" || tab === "IMMEDIATE"
  const showOffers = tab === "ALL" || tab === "OFFER"
  const showUpcoming = tab === "UPCOMING"

  function selectTab(nextTab: HomeTab) {
    if (nextTab === "IMMEDIATE") {
      navigate("/immediate")
      return
    }

    if (nextTab === "OFFER") {
      navigate("/offers")
      return
    }

    setTab(nextTab)
  }

  return (
    <div className="pb-8">
      <div className="sticky top-16 z-20 border-b border-neutral-100 bg-white px-5 py-3 md:top-[72px] md:px-8">
        <div className="grid grid-cols-4 gap-2 md:max-w-xl md:gap-3">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`h-11 rounded-lg border text-[13px] font-bold transition-colors md:h-12 md:text-sm ${
                tab === item.value
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white text-neutral-500"
              }`}
              onClick={() => selectTab(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {showUpcoming && <UpcomingRelease />}

      {showImmediate && (
        <section className="pt-7">
          <SectionHeader
            title="즉시구매 상품"
            description="기다림 없이 바로 만날 수 있어요"
            to="/immediate"
          />
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 md:px-8">
            {immediateProducts.isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            {immediateProducts.data?.map((product) => (
              <div key={product.id} className="snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {showOffers && (
        <section className="pt-8">
          <SectionHeader
            title="오퍼구매 이야기"
            description="신발에 담긴 이야기를 읽고 가격을 제안해 보세요"
            to="/offers"
          />
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 md:px-8">
            {offerProducts.isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            {USE_MOCKS
              ? offerStories
                  .filter((story) =>
                    offerProducts.data
                      ? offerProducts.data.some(
                          (product) => product.id === story.productId
                        )
                      : true
                  )
                  .map((story) => (
                    <div key={story.productId} className="snap-start">
                      <StoryCard {...story} horizontal />
                    </div>
                  ))
              : offerProducts.data?.map((product) => (
                  <div key={product.id} className="snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </section>
      )}

      {(immediateProducts.isError || offerProducts.isError) && (
        <p className="px-5 py-8 text-center text-sm text-neutral-500 md:px-8">
          상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      {!showUpcoming && (
        <section className="mx-5 mt-6 grid gap-3 border-y border-neutral-200 py-5 md:mx-8 md:grid-cols-2">
          <Link
            to="/search"
            className="flex items-center justify-between bg-[#f5f7ff] p-4"
          >
            <div>
              <p className="text-xs font-semibold text-[#5b72f2]">
                무엇을 찾고 있나요?
              </p>
              <p className="mt-1 text-sm font-bold">
                상품명과 이야기로 검색하기
              </p>
            </div>
            <ArrowRight className="size-5" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-between bg-[#fff5f3] p-4"
          >
            <div>
              <p className="text-xs font-semibold text-[#e65f53]">
                나의 D:EAR
              </p>
              <p className="mt-1 text-sm font-bold">
                로그인하고 오퍼 관리하기
              </p>
            </div>
            <ArrowRight className="size-5" />
          </Link>
        </section>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  description,
  to,
}: {
  title: string
  description: string
  to: string
}) {
  return (
    <div className="mb-4 flex items-end justify-between px-5 md:px-8">
      <div>
        <h2 className="text-xl font-extrabold">{title}</h2>
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      </div>
      <Link
        to={to}
        className="flex items-center gap-1 text-xs font-semibold text-neutral-500"
      >
        전체보기
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="w-44 shrink-0 animate-pulse">
      <div className="aspect-square rounded-lg bg-neutral-100" />
      <div className="mt-3 h-3 w-16 bg-neutral-100" />
      <div className="mt-2 h-4 w-full bg-neutral-100" />
      <div className="mt-2 h-4 w-24 bg-neutral-100" />
    </div>
  )
}
