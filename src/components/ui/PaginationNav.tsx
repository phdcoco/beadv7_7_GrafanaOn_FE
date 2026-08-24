import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PaginationInfo } from "@/types/api"

type PaginationNavProps = {
  pagination: PaginationInfo
  label: string
  onPageChange: (page: number) => void
}

export function PaginationNav({
  pagination,
  label,
  onPageChange,
}: PaginationNavProps) {
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <nav
      className="flex items-center justify-center gap-3 border-t border-neutral-100 px-5 py-6"
      aria-label={label}
    >
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-md border border-neutral-200 disabled:text-neutral-300"
        disabled={!pagination.hasPrevious}
        aria-label="이전 페이지"
        onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="min-w-16 text-center text-xs font-bold">
        {pagination.currentPage} / {pagination.totalPages}
      </span>
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-md border border-neutral-200 disabled:text-neutral-300"
        disabled={!pagination.hasNext}
        aria-label="다음 페이지"
        onClick={() => onPageChange(pagination.currentPage + 1)}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
