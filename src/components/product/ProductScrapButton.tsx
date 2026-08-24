import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bookmark } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { addScrap, deleteScrap, getAllScraps } from "@/api/scrapApi"
import { isAuthenticated } from "@/lib/authStorage"

type ProductScrapButtonProps = {
  productId: number
  className?: string
}

export function ProductScrapButton({
  productId,
  className = "",
}: ProductScrapButtonProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loggedIn = isAuthenticated()

  const scrapsQuery = useQuery({
    queryKey: ["scraps", "me", "lookup"],
    queryFn: getAllScraps,
    enabled: loggedIn,
  })
  const scrapped =
    scrapsQuery.data?.some((scrap) => scrap.id === productId) ?? false

  const scrapMutation = useMutation({
    mutationFn: async () => {
      if (scrapped) {
        await deleteScrap(productId)
        return
      }

      await addScrap(productId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scraps", "me"] })
    },
  })

  function handleScrap() {
    if (!loggedIn) {
      const redirect = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    scrapMutation.mutate()
  }

  return (
    <button
      type="button"
      className={`flex size-8 items-center justify-center rounded-full shadow-sm transition ${
        scrapped
          ? "bg-brand text-white"
          : "bg-white/92 text-neutral-700 hover:bg-white"
      } ${className}`}
      aria-label={scrapped ? "관심 상품에서 삭제" : "관심 상품에 추가"}
      aria-pressed={scrapped}
      disabled={
        scrapMutation.isPending || (loggedIn && scrapsQuery.isLoading)
      }
      onClick={handleScrap}
    >
      <Bookmark className="size-4" fill={scrapped ? "currentColor" : "none"} />
    </button>
  )
}
