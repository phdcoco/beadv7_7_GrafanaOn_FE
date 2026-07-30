import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type {
  MemberProfile,
  SellerAccount,
  SellerAccountRequest,
  UpdateMemberProfileRequest,
} from "@/types/member"

export async function getMemberProfile(memberId?: number) {
  if (USE_MOCKS) {
    return {
      id: memberId ?? 1,
      name: "김디어",
      defaultShippingAddress: "서울특별시 강남구 테헤란로",
      phoneNumber: "010-1234-5678",
      nickname: "신발이야기꾼",
    }
  }

  const { data } = await apiClient.get<ApiResponse<MemberProfile>>(
    "/api/members/profile",
    { params: memberId ? { memberId } : undefined }
  )

  return unwrapData(data)
}

export async function updateMemberProfile(request: UpdateMemberProfileRequest) {
  if (USE_MOCKS) {
    return {
      id: 1,
      name: "김디어",
      ...request,
    }
  }

  const { data } = await apiClient.patch<ApiResponse<MemberProfile>>(
    "/api/members/profile/me",
    request
  )

  return unwrapData(data)
}

export async function getSellerAccount() {
  if (USE_MOCKS) {
    return { bank: "디어은행", account: "123-****-7890" }
  }

  const { data } = await apiClient.get<ApiResponse<SellerAccount>>(
    "/api/members/me/seller"
  )
  return unwrapData(data)
}

export async function registerSeller(request: SellerAccountRequest) {
  if (!USE_MOCKS) {
    await apiClient.post<ApiResponse<void>>("/api/members/me/seller", request)
  }
}

export async function updateSellerAccount(request: SellerAccountRequest) {
  if (!USE_MOCKS) {
    await apiClient.patch<ApiResponse<void>>("/api/members/me/seller", request)
  }
}

export async function unregisterSeller() {
  if (!USE_MOCKS) {
    await apiClient.delete<ApiResponse<void>>("/api/members/me/seller")
  }
}
