import { apiClient } from "@/lib/apiClient"
import type { ApiResponse } from "@/types/api"
import type { MemberProfile } from "@/types/member"

const useMocks = import.meta.env.VITE_USE_MOCKS !== "false"

export async function getMemberProfile(memberId: number) {
  if (useMocks) {
    return {
      id: memberId,
      name: "김디어",
      defaultShippingAddress: "서울특별시 강남구 테헤란로",
      phoneNumber: "010-1234-5678",
      nickname: "신발이야기꾼",
    }
  }

  const { data } = await apiClient.get<ApiResponse<MemberProfile>>(
    "/api/members/profile",
    { params: { memberId } }
  )

  return data.data
}
