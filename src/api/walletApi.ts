import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type { Wallet } from "@/types/financial"

export async function getMyWallet() {
  if (USE_MOCKS) {
    return { availableBalance: 280000, heldBalance: 92000 }
  }

  const { data } = await apiClient.get<ApiResponse<Wallet>>("/api/deposits/me")
  return unwrapData(data)
}
