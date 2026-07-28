import { apiClient } from "@/lib/apiClient"
import type { ApiResponse } from "@/types/api"
import type { MemberProfile } from "@/types/member"

export async function getMemberProfile(memberId: number) {
  const { data } = await apiClient.get<ApiResponse<MemberProfile>>(
    "/api/members/profile",
    { params: { memberId } }
  )

  return data.data
}
