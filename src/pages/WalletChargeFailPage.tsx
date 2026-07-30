import { Link, useSearchParams } from "react-router-dom"
import { CircleX } from "lucide-react"

export function WalletChargeFailPage() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get("code")
  const message = searchParams.get("message")
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"))
  const canceled = code === "PAY_PROCESS_CANCELED"
  const retrySearch = returnTo
    ? `?${new URLSearchParams({ returnTo }).toString()}`
    : ""

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4f1] px-5 py-10">
      <section className="w-full max-w-md border border-neutral-200 bg-white px-6 py-9 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <CircleX className="size-10" />
        </span>
        <h1 className="mt-5 text-xl font-black">
          {canceled ? "예치금 충전을 취소했습니다" : "결제를 완료하지 못했습니다"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {canceled
            ? "결제된 금액은 없습니다."
            : message || "결제 정보를 확인한 후 다시 시도해 주세요."}
        </p>
        {code && !canceled && (
          <p className="mt-3 text-xs font-bold text-neutral-400">{code}</p>
        )}
        <div className="mt-7 grid grid-cols-2 gap-2">
          <Link
            to={returnTo ?? "/profile"}
            className="flex h-11 items-center justify-center rounded-md border border-neutral-300 text-sm font-bold"
          >
            돌아가기
          </Link>
          <Link
            to={`/wallet/charge${retrySearch}`}
            className="flex h-11 items-center justify-center rounded-md bg-brand text-sm font-black text-white"
          >
            다시 충전
          </Link>
        </div>
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
