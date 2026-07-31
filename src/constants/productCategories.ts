import type { ProductCategory } from "@/types/product"

export type ProductCategoryFilter = "ALL" | ProductCategory

export const productCategoryOptions: Array<{
  value: ProductCategoryFilter
  label: string
}> = [
  { value: "ALL", label: "전체" },
  { value: "SNEAKERS", label: "스니커즈" },
  { value: "SPORTS_SHOES", label: "스포츠화" },
  { value: "DRESS_SHOES", label: "구두" },
  { value: "BOOTS", label: "부츠/워커" },
  { value: "SANDALS_SLIDES", label: "샌들/슬리퍼" },
  { value: "WINTER_SHOES", label: "패딩/퍼 신발" },
]
