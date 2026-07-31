import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type { SettlementPreview } from "@/types/settlement"

export async function getSettlementPreview(targetMonth: string) {
  if (USE_MOCKS) {
    return {
      netAmount: 328000,
    }
  }

  const { data } = await apiClient.get<ApiResponse<SettlementPreview>>(
    "/api/settlements/me",
    { params: { targetMonth } }
  )

  return unwrapData(data)
}
