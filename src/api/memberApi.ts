import { apiClient, ApiClientError } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type {
  MemberProfile,
  SellerAccount,
  SellerAccountRequest,
  UpdateMemberProfileRequest,
} from "@/types/member"

const MOCK_SELLER_ACCOUNT_KEY = "dear-mock-seller-account"

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

export async function getSellerAccount(): Promise<SellerAccount | null> {
  if (USE_MOCKS) {
    return readMockSellerAccount()
  }

  try {
    const { data } = await apiClient.get<ApiResponse<SellerAccount>>(
      "/api/members/me/seller"
    )
    return unwrapData(data)
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "MB-005") {
      return null
    }

    throw error
  }
}

export async function registerSeller(request: SellerAccountRequest) {
  if (USE_MOCKS) {
    writeMockSellerAccount({
      bank: request.bank,
      account: maskAccount(request.account),
    })
    return
  }

  await apiClient.post<ApiResponse<void>>("/api/members/me/seller", request)
}

export async function updateSellerAccount(request: SellerAccountRequest) {
  if (USE_MOCKS) {
    writeMockSellerAccount({
      bank: request.bank,
      account: maskAccount(request.account),
    })
    return
  }

  await apiClient.patch<ApiResponse<void>>("/api/members/me/seller", request)
}

export async function unregisterSeller() {
  if (USE_MOCKS) {
    localStorage.removeItem(MOCK_SELLER_ACCOUNT_KEY)
    return
  }

  await apiClient.delete<ApiResponse<void>>("/api/members/me/seller")
}

function readMockSellerAccount(): SellerAccount | null {
  try {
    const storedAccount = localStorage.getItem(MOCK_SELLER_ACCOUNT_KEY)
    return storedAccount ? JSON.parse(storedAccount) : null
  } catch {
    return null
  }
}

function writeMockSellerAccount(account: SellerAccount) {
  localStorage.setItem(MOCK_SELLER_ACCOUNT_KEY, JSON.stringify(account))
}

function maskAccount(account: string) {
  const digits = account.replace(/\D/g, "")

  if (digits.length <= 4) {
    return "*".repeat(digits.length)
  }

  return `${digits.slice(0, 3)}-${"*".repeat(Math.max(4, digits.length - 6))}-${digits.slice(-3)}`
}
