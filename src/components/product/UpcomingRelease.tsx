import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { CalendarClock, LockKeyhole, Package } from "lucide-react"
import {
  formatReleaseDate,
  getNextReleaseAt,
  getReleaseCountdown,
} from "@/lib/releaseSchedule"

const upcomingCategories = [
  { category: "스니커즈", count: 4, color: "#e9eef4" },
  { category: "스포츠화", count: 2, color: "#edf1e9" },
  { category: "구두", count: 3, color: "#eeeae7" },
  { category: "샌들/슬리퍼", count: 2, color: "#f0ede5" },
]

export function UpcomingRelease() {
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => new Date())
  const [releaseAt, setReleaseAt] = useState(() => getNextReleaseAt())

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = new Date()

      if (current.getTime() >= releaseAt.getTime()) {
        void queryClient.invalidateQueries({ queryKey: ["products"] })
        void queryClient.invalidateQueries({ queryKey: ["search-products"] })
        setReleaseAt(getNextReleaseAt(current))
      }

      setNow(current)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [queryClient, releaseAt])

  const countdown = getReleaseCountdown(now, releaseAt)
  const totalProducts = upcomingCategories.reduce(
    (total, item) => total + item.count,
    0
  )

  return (
    <div>
      <section className="bg-neutral-950 px-5 py-7 text-white md:px-8 md:py-9">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#70d6cc]">
              <CalendarClock className="size-4" />
              매일 오후 8시 공개
            </div>
            <h1 className="mt-3 text-2xl font-black leading-8">
              아직 공개되지 않은
              <br />
              새로운 상품이 있어요
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              {formatReleaseDate(releaseAt)}에 {totalProducts}개 상품이
              한꺼번에 열립니다.
            </p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white/10">
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
          공개 전에는 카테고리와 상품 수량만 확인할 수 있어요. 상품명,
          사진, 가격과 이야기는 오후 8시에 공개됩니다.
        </p>
      </div>

      <div className="space-y-9 px-5 py-7 md:px-8">
        {upcomingCategories.map((item) => (
          <section key={item.category}>
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-lg font-extrabold">{item.category}</h2>
              <span className="text-xs font-semibold text-neutral-400">
                {item.count}개 공개 예정
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: item.count }).map((_, index) => (
                <UpcomingSlot
                  key={`${item.category}-${index}`}
                  category={item.category}
                  color={item.color}
                  index={index + 1}
                />
              ))}
            </div>
          </section>
        ))}
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

function UpcomingSlot({
  category,
  color,
  index,
}: {
  category: string
  color: string
  index: number
}) {
  return (
    <article>
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-25 blur-[3px]">
          <Package className="size-20 stroke-1" />
        </div>
        <div className="absolute inset-0 bg-white/35 backdrop-blur-md" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <LockKeyhole className="size-4 text-neutral-700" />
          </span>
          <p className="mt-3 text-xs font-bold text-neutral-700">공개 전</p>
        </div>
        <span className="absolute left-2 top-2 rounded bg-neutral-950/70 px-1.5 py-1 text-[10px] font-semibold text-white">
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold text-neutral-500">{category}</p>
      <p className="mt-1 text-sm font-bold text-neutral-900">
        오후 8시에 공개됩니다
      </p>
    </article>
  )
}
