import { useEffect, useRef, useState, type FormEvent, type UIEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  Images,
  Share2,
  ShoppingCart,
  X,
} from "lucide-react"
import { addCartItem } from "@/api/cartApi"
import { createOffer, createOfferSnapshot } from "@/api/offerApi"
import { getMemberProfile } from "@/api/memberApi"
import { getProductDetail } from "@/api/productApi"
import { addScrap, deleteScrap, getAllScraps } from "@/api/scrapApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const parsedProductId = Number(productId)
  const querySaleType = searchParams.get("saleType") as ProductSaleType | null
  const loggedIn = isAuthenticated()
  const [activeIndex, setActiveIndex] = useState(0)
  const [furthestViewedIndex, setFurthestViewedIndex] = useState(0)
  const [scrapped, setScrapped] = useState(false)
  const [offerFormOpen, setOfferFormOpen] = useState(false)
  const [delivery, setDelivery] = useState("")
  const [offerTitle, setOfferTitle] = useState("")
  const [offerStory, setOfferStory] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const sliderRef = useRef<HTMLDivElement>(null)

  const productQuery = useQuery({
    queryKey: ["product-detail", parsedProductId, querySaleType],
    queryFn: () =>
      getProductDetail(parsedProductId, querySaleType ?? undefined),
    enabled: Number.isFinite(parsedProductId),
  })

  const profileQuery = useQuery({
    queryKey: ["member-profile", "me"],
    queryFn: () => getMemberProfile(),
    enabled: loggedIn,
  })

  const scrapsQuery = useQuery({
    queryKey: ["scraps", "me", "lookup"],
    queryFn: getAllScraps,
    enabled: loggedIn,
  })

  useEffect(() => {
    setActiveIndex(0)
    setFurthestViewedIndex(0)
  }, [parsedProductId])

  useEffect(() => {
    if (!delivery && profileQuery.data?.defaultShippingAddress) {
      setDelivery(profileQuery.data.defaultShippingAddress)
    }
  }, [delivery, profileQuery.data])

  useEffect(() => {
    if (!scrapsQuery.data) {
      return
    }

    setScrapped(
      scrapsQuery.data.some((scrap) => scrap.id === parsedProductId)
    )
  }, [parsedProductId, scrapsQuery.data])

  const scrapMutation = useMutation({
    mutationFn: async () => {
      if (scrapped) {
        await deleteScrap(parsedProductId)
        return
      }

      await addScrap(parsedProductId)
    },
    onSuccess: () => {
      setScrapped((current) => !current)
      void queryClient.invalidateQueries({ queryKey: ["scraps", "me"] })
    },
  })

  const cartMutation = useMutation({
    mutationFn: () => addCartItem(parsedProductId),
    onSuccess: () => {
      setErrorMessage("")
      setSuccessMessage("장바구니에 담았습니다.")
      void queryClient.invalidateQueries({ queryKey: ["cart", "me"] })
    },
    onError: (error) => {
      setSuccessMessage("")
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const offerMutation = useMutation({
    mutationFn: async () => {
      const snapshot = await createOfferSnapshot(parsedProductId)
      return createOffer({
        snapshotId: snapshot.snapshotId,
        title: offerTitle.trim(),
        story: offerStory.trim(),
        delivery: delivery.trim(),
      })
    },
    onSuccess: (offer) => {
      setOfferFormOpen(false)
      setSuccessMessage(`오퍼 ${offer.number}이 등록되었습니다.`)
    },
  })

  if (productQuery.isLoading) {
    return <DetailLoading />
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-semibold">상품 상세를 불러오지 못했습니다.</p>
        <p className="text-xs text-neutral-500">
          {loggedIn
            ? getApiErrorMessage(productQuery.error)
            : "상품 상세를 보려면 로그인이 필요합니다."}
        </p>
        <Link
          to={loggedIn ? "/" : `/login?redirect=/products/${parsedProductId}?saleType=${querySaleType ?? "IMMEDIATE"}`}
          className="text-sm font-bold underline"
        >
          {loggedIn ? "홈으로 돌아가기" : "로그인하기"}
        </Link>
      </div>
    )
  }

  const product = productQuery.data
  const saleType = product.saleType ?? querySaleType
  const isOffer = saleType === "OFFER"
  const isSeller = profileQuery.data?.id === product.sellerId
  const viewedAllOfferImages =
    product.images.length > 0 &&
    furthestViewedIndex >= product.images.length - 1

  function requireLogin() {
    if (loggedIn) {
      return true
    }

    const redirect = `${window.location.pathname}${window.location.search}`
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
    return false
  }

  function handleSlide(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget
    const nextIndex = Math.round(target.scrollLeft / target.clientWidth)
    setActiveIndex(nextIndex)
    setFurthestViewedIndex((current) => Math.max(current, nextIndex))
  }

  function moveSlide(nextIndex: number) {
    const safeIndex = Math.max(0, Math.min(nextIndex, product.images.length - 1))
    setFurthestViewedIndex((current) => Math.max(current, safeIndex))
    sliderRef.current?.scrollTo({
      left: sliderRef.current.clientWidth * safeIndex,
      behavior: "smooth",
    })
  }

  function handleScrap() {
    if (requireLogin()) {
      scrapMutation.mutate()
    }
  }

  function handleAddToCart() {
    if (!requireLogin()) {
      return
    }

    setSuccessMessage("")
    setErrorMessage("")
    cartMutation.mutate()
  }

  async function handleShare() {
    const shareData = { title: product.name, url: window.location.href }

    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard.writeText(window.location.href)
    setSuccessMessage("상품 링크를 복사했습니다.")
  }

  function openOfferForm() {
    if (!requireLogin()) {
      return
    }

    setSuccessMessage("")
    setOfferFormOpen(true)
  }

  function openCheckout() {
    if (requireLogin()) {
      navigate(`/checkout/${parsedProductId}`)
    }
  }

  function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    offerMutation.mutate()
  }

  const actionPending = offerMutation.isPending
  const actionError = offerMutation.error

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
            aria-label={scrapped ? "상품 저장 해제" : "상품 저장"}
            disabled={scrapMutation.isPending}
            onClick={handleScrap}
          >
            <Bookmark
              className={`size-5 ${scrapped ? "fill-neutral-950" : ""}`}
            />
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="공유"
            onClick={() => void handleShare()}
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
                      <p className="border-l-2 border-brand pl-2 text-xs font-bold text-neutral-900">
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
            <p className="mt-2 text-2xl font-black">
              {formatPrice(product.price)}원
            </p>
            <span
              className={`mt-4 inline-flex rounded px-2 py-1 text-xs font-bold ${
                isOffer
                  ? "bg-brand/15 text-neutral-950"
                  : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {saleType
                ? isOffer
                  ? "오퍼구매"
                  : "즉시구매"
                : "판매방식 미확인"}
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
              <span className="flex size-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-neutral-950">
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
        <div className="mx-auto max-w-[760px]">
          {saleType === "IMMEDIATE" && (
            <div className="grid grid-cols-[minmax(112px,0.8fr)_minmax(0,1.2fr)] gap-2">
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white text-sm font-bold text-neutral-950 hover:border-neutral-950"
                disabled={cartMutation.isPending}
                onClick={handleAddToCart}
              >
                {cartMutation.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                장바구니
              </button>
              <button
                type="button"
                className="h-12 rounded-md bg-neutral-950 text-sm font-bold text-white"
                onClick={openCheckout}
              >
                즉시 구매하기
              </button>
            </div>
          )}

          {isOffer && isSeller && (
            <p className="py-2 text-center text-sm font-semibold text-neutral-600">
              내가 등록한 상품에는 오퍼를 작성할 수 없어요.
            </p>
          )}

          {isOffer && !isSeller && !viewedAllOfferImages && (
            <div className="flex min-h-12 items-center gap-3 px-1">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-neutral-950">
                <Images className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-900">
                  사진과 이야기를 끝까지 확인해 주세요
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  모두 본 뒤 오퍼를 작성할 수 있어요 · {activeIndex + 1}/
                  {product.images.length}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-neutral-400" />
            </div>
          )}

          {isOffer && !isSeller && viewedAllOfferImages && (
            <button
              type="button"
              className="h-12 w-full rounded-md bg-brand text-sm font-bold text-neutral-950 hover:brightness-95"
              onClick={openOfferForm}
            >
              오퍼 작성하기
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-md items-center gap-2 rounded-md bg-neutral-950 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <CheckCircle2 className="size-4 shrink-0 text-brand" />
          <span className="flex-1">{successMessage}</span>
          <button
            type="button"
            aria-label="알림 닫기"
            onClick={() => setSuccessMessage("")}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-md items-center gap-2 rounded-md bg-red-700 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <CircleAlert className="size-4 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            aria-label="오류 알림 닫기"
            onClick={() => setErrorMessage("")}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {offerFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 md:items-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="거래 창 닫기"
            onClick={() => setOfferFormOpen(false)}
          />
          <section className="relative z-10 w-full max-w-lg rounded-t-lg bg-white p-5 md:rounded-lg md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-neutral-400">
                  OFFER
                </p>
                <h2 className="mt-1 text-xl font-black">나의 오퍼 작성</h2>
              </div>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full hover:bg-neutral-100"
                aria-label="닫기"
                onClick={() => setOfferFormOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={submitAction}>
              <FormField
                label="이야기 제목"
                value={offerTitle}
                placeholder="이 신발을 만나고 싶은 이유"
                maxLength={120}
                onChange={setOfferTitle}
              />
              <label className="block">
                <span className="mb-2 block text-xs font-bold">나의 이야기</span>
                <textarea
                  value={offerStory}
                  onChange={(event) => setOfferStory(event.target.value)}
                  className="min-h-28 w-full resize-none rounded-md border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-brand"
                  placeholder="판매자에게 전할 이야기를 적어 주세요"
                  required
                />
              </label>

              <FormField
                label="배송지"
                value={delivery}
                placeholder="상품을 받을 주소"
                maxLength={255}
                onChange={setDelivery}
              />

              <div className="flex items-center justify-between border-y border-neutral-100 py-4">
                <span className="text-sm text-neutral-500">상품 금액</span>
                <strong className="text-lg">{formatPrice(product.price)}원</strong>
              </div>

              {actionError && (
                <p className="text-sm text-red-600">
                  {getApiErrorMessage(actionError)}
                </p>
              )}

              <button
                type="submit"
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-bold text-white ${
                  "bg-brand text-neutral-950 hover:brightness-95"
                }`}
                disabled={actionPending}
              >
                {actionPending && <LoaderCircle className="size-4 animate-spin" />}
                {actionPending
                  ? "처리 중..."
                  : "오퍼 보내기"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

function FormField({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  maxLength: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-brand"
        placeholder={placeholder}
        maxLength={maxLength}
        required
      />
    </label>
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
