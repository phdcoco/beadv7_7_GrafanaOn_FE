import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react"
import { confirmCharge } from "@/api/walletApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { formatPrice } from "@/lib/format"

export function WalletChargeSuccessPage() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const paymentKey = searchParams.get("paymentKey")
  const orderId = searchParams.get("orderId")
  const amount = Number(searchParams.get("amount"))
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"))
  const validParameters =
    Boolean(paymentKey) &&
    Boolean(orderId) &&
    Number.isInteger(amount) &&
    amount > 0

  const {
    mutate: startConfirmation,
    isIdle,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: confirmCharge,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wallet", "me"] })
    },
  })

  useEffect(() => {
    if (!validParameters) {
      return
    }

    startConfirmation({
      paymentKey: paymentKey!,
      orderId: orderId!,
      amount,
    })
  }, [amount, orderId, paymentKey, startConfirmation, validParameters])

  if (!validParameters) {
    return (
      <ChargeResult
        icon={<CircleAlert className="size-10" />}
        iconClassName="bg-red-50 text-red-600"
        title="결제 정보를 확인할 수 없습니다"
        description="잘못된 충전 요청입니다. 마이페이지에서 다시 시도해 주세요."
        actionTo="/wallet/charge"
        actionLabel="다시 충전하기"
      />
    )
  }

  if (isPending || isIdle) {
    return (
      <ChargeResult
        icon={<LoaderCircle className="size-9 animate-spin" />}
        iconClassName="bg-[#fff1e8] text-brand"
        title="예치금을 충전하고 있어요"
        description="결제 승인 결과를 확인하고 있습니다. 잠시만 기다려 주세요."
      />
    )
  }

  if (isError) {
    return (
      <ChargeResult
        icon={<CircleAlert className="size-10" />}
        iconClassName="bg-red-50 text-red-600"
        title="예치금 충전을 완료하지 못했습니다"
        description={getApiErrorMessage(error)}
        actionTo="/wallet/charge"
        actionLabel="다시 충전하기"
      />
    )
  }

  return (
    <ChargeResult
      icon={<CheckCircle2 className="size-10" />}
      iconClassName="bg-[#fff1e8] text-brand"
      title="예치금 충전이 완료되었습니다"
      description={`${formatPrice(amount)}원이 사용 가능 예치금에 반영됐어요.`}
      actionTo={returnTo ?? "/profile"}
      actionLabel={returnTo ? "결제 계속하기" : "마이페이지로 이동"}
      secondaryTo="/wallet/charge"
      secondaryLabel="추가 충전"
    />
  )
}

function ChargeResult({
  icon,
  iconClassName,
  title,
  description,
  actionTo,
  actionLabel,
  secondaryTo,
  secondaryLabel,
}: {
  icon: React.ReactNode
  iconClassName: string
  title: string
  description: string
  actionTo?: string
  actionLabel?: string
  secondaryTo?: string
  secondaryLabel?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4f1] px-5 py-10">
      <section className="w-full max-w-md border border-neutral-200 bg-white px-6 py-9 text-center">
        <span
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${iconClassName}`}
        >
          {icon}
        </span>
        <h1 className="mt-5 text-xl font-black">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>

        {actionTo && actionLabel && (
          <div
            className={`mt-7 grid gap-2 ${
              secondaryTo ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {secondaryTo && secondaryLabel && (
              <Link
                to={secondaryTo}
                className="flex h-11 items-center justify-center rounded-md border border-neutral-300 text-sm font-bold"
              >
                {secondaryLabel}
              </Link>
            )}
            <Link
              to={actionTo}
              className="flex h-11 items-center justify-center rounded-md bg-brand text-sm font-black text-white"
            >
              {actionLabel}
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

function getSafeReturnTo(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null
  }

  return value
}
