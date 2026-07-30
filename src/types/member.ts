export type MemberProfile = {
  id: number
  name: string
  defaultShippingAddress: string
  phoneNumber: string
  nickname: string
}

export type UpdateMemberProfileRequest = Pick<
  MemberProfile,
  "defaultShippingAddress" | "phoneNumber" | "nickname"
>

export type SellerAccount = {
  bank: string
  account: string
}

export type SellerAccountRequest = SellerAccount
