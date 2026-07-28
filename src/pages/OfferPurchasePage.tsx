import { useState } from "react"
import { BookOpenText, Flame, Sparkles } from "lucide-react"
import { StoryCard } from "@/components/product/StoryCard"
import { offerStories } from "@/data/mockProducts"

const filters = [
  { label: "새로운 이야기", icon: Sparkles },
  { label: "많이 보는 이야기", icon: Flame },
  { label: "오퍼가 열린 이야기", icon: BookOpenText },
]

export function OfferPurchasePage() {
  const [selectedFilter, setSelectedFilter] = useState(filters[0].label)

  return (
    <div className="pb-6">
      <div className="sticky top-16 z-20 border-b border-neutral-100 bg-white px-5 py-4 md:top-[72px] md:px-8">
        <h1 className="text-xl font-extrabold">오퍼구매</h1>
        <p className="mt-1 text-xs text-neutral-500">
          가격보다 먼저, 이 신발이 지나온 시간을 읽어보세요.
        </p>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-semibold ${
                selectedFilter === filter.label
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white text-neutral-600"
              }`}
              onClick={() => setSelectedFilter(filter.label)}
            >
              <filter.icon className="size-4" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 md:gap-4 md:p-8 lg:grid-cols-3">
        {offerStories.map((story) => (
          <StoryCard key={story.productId} {...story} />
        ))}
      </div>
    </div>
  )
}
