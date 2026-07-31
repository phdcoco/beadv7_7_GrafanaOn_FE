import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  Inbox,
  LoaderCircle,
  MapPin,
  X,
} from "lucide-react"
import {
  acceptOffer,
  getOffersByProduct,
  rejectOffer,
} from "@/api/offerApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { formatPrice } from "@/lib/format"
import type { OfferStatus } from "@/types/order"

type OfferFilter = "ALL" | OfferStatus
type OfferAction = "accept" | "reject"

const filters: Array<{ value: OfferFilter; label: string }> = [
  { value: "PENDING", label: "대기" },
  { value: "ALL", label: "전체" },
  { value: "ACCEPTED", label: "수락" },
  { value: "REJECTED", label: "거절" },
]

const statusLabels: Record<OfferStatus, string> = {
  PENDING: "응답 대기",
  ACCEPTED: "수락 완료",
  REJECTED: "거절 완료",
  CANCELLED: "구매자 취소",
  PRODUCT_DELETED: "상품 삭제",
}

const statusClasses: Record<OfferStatus, string> = {
  PENDING: "bg-brand/15 text-neutral-900",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
  CANCELLED: "bg-neutral-100 text-neutral-500",
  PRODUCT_DELETED: "bg-neutral-100 text-neutral-500",
}

export function SellerOffersPage() {
  const { productId } = useParams()
  const parsedProductId = Number(productId)
  const validProductId = Number.isInteger(parsedProductId) && parsedProductId > 0
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<OfferFilter>("PENDING")
  const [successMessage, setSuccessMessage] = useState("")

  const offersQuery = useQuery({
    queryKey: ["seller-offers", parsedProductId, filter],
    queryFn: () =>
      getOffersByProduct(
        parsedProductId,
        filter === "ALL" ? undefined : [filter]
      ),
    enabled: validProductId,
  })

  const actionMutation = useMutation({
    mutationFn: ({
      offerId,
      action,
    }: {
      offerId: number
      action: OfferAction
    }) =>
      action === "accept" ? acceptOffer(offerId) : rejectOffer(offerId),
    onSuccess: async (_, variables) => {
      setSuccessMessage(
        variables.action === "accept"
          ? "오퍼를 수락했습니다."
          : "오퍼를 거절했습니다."
      )
      await queryClient.invalidateQueries({
        queryKey: ["seller-offers", parsedProductId],
      })
    },
  })

  function handleOfferAction(offerId: number, action: OfferAction) {
    const confirmed = window.confirm(
      action === "accept"
        ? "이 오퍼를 수락할까요? 수락하면 거래가 시작됩니다."
        : "이 오퍼를 거절할까요? 거절 후에는 되돌릴 수 없습니다."
    )

    if (!confirmed) {
      return
    }

    setSuccessMessage("")
    actionMutation.mutate({ offerId, action })
  }

  if (!validProductId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-bold">올바르지 않은 상품입니다.</p>
        <Link to="/profile" className="mt-5 text-sm font-bold text-brand">
          마이페이지로 돌아가기
        </Link>
      </div>
    )
  }

  const offers = offersQuery.data ?? []

  return (
    <div className="mx-auto min-h-screen max-w-[760px] bg-white pb-10">
      <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white">
        <div className="flex h-14 items-center gap-2 px-3">
          <Link
            to="/profile"
            className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="마이페이지로 돌아가기"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-neutral-400">
              상품 #{parsedProductId}
            </p>
            <h1 className="truncate text-base font-black">받은 오퍼</h1>
          </div>
          <Link
            to={`/products/${parsedProductId}?saleType=OFFER`}
            className="text-xs font-bold text-brand"
          >
            상품 보기
          </Link>
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`h-9 shrink-0 rounded-md px-4 text-xs font-bold ${
                filter === item.value
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-500"
              }`}
              onClick={() => {
                setFilter(item.value)
                setSuccessMessage("")
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {successMessage && (
        <p className="mx-4 mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {successMessage}
        </p>
      )}

      {actionMutation.isError && (
        <p className="mx-4 mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {getApiErrorMessage(actionMutation.error)}
        </p>
      )}

      {offersQuery.isLoading && (
        <div className="space-y-3 p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-md bg-neutral-100"
            />
          ))}
        </div>
      )}

      {offersQuery.isError && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-bold">오퍼를 불러오지 못했습니다.</p>
          <p className="mt-2 text-xs text-neutral-500">
            {getApiErrorMessage(offersQuery.error)}
          </p>
        </div>
      )}

      {!offersQuery.isLoading && !offersQuery.isError && offers.length === 0 && (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
          <Inbox className="size-9 text-neutral-300" />
          <p className="mt-4 text-sm font-black">
            {filter === "PENDING"
              ? "응답을 기다리는 오퍼가 없습니다."
              : "해당 상태의 오퍼가 없습니다."}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            새로운 오퍼가 도착하면 여기에서 확인할 수 있어요.
          </p>
        </div>
      )}

      {offers.length > 0 && (
        <div className="divide-y divide-neutral-100 px-4">
          {offers.map((offer) => {
            const processing =
              actionMutation.isPending &&
              actionMutation.variables?.offerId === offer.id

            return (
              <article key={offer.id} className="py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-400">
                      {offer.number}
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-[15px] font-black leading-6">
                      {offer.title}
                    </h2>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-1 text-[10px] font-black ${
                      statusClasses[offer.status]
                    }`}
                  >
                    {statusLabels[offer.status]}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                  {offer.story}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                  <div>
                    <p className="text-[11px] text-neutral-400">오퍼 금액</p>
                    <p className="mt-0.5 text-base font-black">
                      {formatPrice(offer.amount)}원
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400">
                      <MapPin className="size-3" />
                      {offer.delivery}
                    </p>
                  </div>

                  {offer.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex h-10 items-center gap-1.5 rounded-md border border-neutral-300 px-4 text-xs font-bold disabled:text-neutral-300"
                        disabled={actionMutation.isPending}
                        onClick={() => handleOfferAction(offer.id, "reject")}
                      >
                        <X className="size-4" />
                        거절
                      </button>
                      <button
                        type="button"
                        className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-black text-white disabled:bg-neutral-200"
                        disabled={actionMutation.isPending}
                        onClick={() => handleOfferAction(offer.id, "accept")}
                      >
                        {processing ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        수락
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
