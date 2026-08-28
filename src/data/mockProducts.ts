import type {
  ProductDetail,
  ProductSummary,
} from "@/types/product"

export const mockProducts: ProductSummary[] = [
  {
    id: 1,
    saleType: "IMMEDIATE",
    status: "ON_SALE",
    category: "SNEAKERS",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    name: "XT-6 ADV 리미티드 화이트",
    brand: "Salomon",
    price: 145000,
    viewCount: 1240,
  },
  {
    id: 2,
    saleType: "IMMEDIATE",
    status: "ON_SALE",
    category: "SPORTS_SHOES",
    url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=85",
    name: "도쿄 블루 버드 클라우드",
    brand: "Adidas",
    price: 53000,
    viewCount: 830,
  },
  {
    id: 3,
    saleType: "IMMEDIATE",
    status: "ON_SALE",
    category: "SNEAKERS",
    url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85",
    name: "에어 조던 레트로 하이",
    brand: "Jordan",
    price: 459000,
    viewCount: 2240,
  },
  {
    id: 4,
    saleType: "IMMEDIATE",
    status: "PREPARING",
    category: "SANDALS_SLIDES",
    url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
    name: "볼륨 위빙 슬라이드 블랙",
    brand: "Helena Paris",
    price: 34060,
    viewCount: 104,
  },
  {
    id: 5,
    saleType: "IMMEDIATE",
    status: "ON_SALE",
    category: "SPORTS_SHOES",
    url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85",
    name: "프라임 트랙 베이지",
    brand: "Descente",
    price: 160550,
    viewCount: 350,
  },
  {
    id: 6,
    saleType: "IMMEDIATE",
    status: "ON_SALE",
    category: "SNEAKERS",
    url: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=85",
    name: "핸드볼 스페지알 로우",
    brand: "Adidas",
    price: 62790,
    viewCount: 356,
  },
  {
    id: 7,
    saleType: "OFFER",
    status: "ON_SALE",
    category: "DRESS_SHOES",
    url: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=85",
    name: "면접 날 처음 함께한 구두",
    brand: "Dr. Martens",
    price: 118000,
    viewCount: 692,
  },
  {
    id: 8,
    saleType: "OFFER",
    status: "ON_SALE",
    category: "SPORTS_SHOES",
    url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=900&q=85",
    name: "혼자 걷던 여행의 러닝화",
    brand: "New Balance",
    price: 92000,
    viewCount: 481,
  },
  {
    id: 9,
    saleType: "OFFER",
    status: "ON_SALE",
    category: "SNEAKERS",
    url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=85",
    name: "오래 신을수록 편했던 운동화",
    brand: "Nike",
    price: 135000,
    viewCount: 955,
  },
  {
    id: 10,
    saleType: "OFFER",
    status: "PREPARING",
    category: "DRESS_SHOES",
    url: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=85",
    name: "첫 출근길을 함께한 검정 구두",
    brand: "Dr. Martens",
    price: 126000,
    viewCount: 0,
  },
  {
    id: 11,
    saleType: "IMMEDIATE",
    status: "PREPARING",
    category: "SPORTS_SHOES",
    url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85",
    name: "프라임 러너 오프화이트",
    brand: "New Balance",
    price: 149000,
    viewCount: 0,
  },
  {
    id: 12,
    saleType: "OFFER",
    status: "PREPARING",
    category: "SPORTS_SHOES",
    url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=85",
    name: "여름 여행에서 만난 러닝화",
    brand: "Nike",
    price: 98000,
    viewCount: 0,
  },
]

const stories: Record<number, string[]> = {
  7: [
    "면접을 앞두고 처음 장만했던 구두예요. 떨리는 마음으로 들어갔던 날부터 좋은 소식을 들었던 순간까지 함께했습니다.",
    "중요한 날마다 꺼내 신었지만 이제는 새로운 주인을 만날 때가 된 것 같아요. 가죽의 결이 자연스럽게 자리 잡았습니다.",
  ],
  8: [
    "혼자 떠난 여행에서 매일 신었던 신발입니다. 낯선 골목을 오래 걸어도 발이 편해서 여행 내내 든든했어요.",
    "작은 사용감까지 이 신발이 가진 시간이라고 생각합니다. 다음 여행을 준비하는 분에게 건네고 싶어요.",
  ],
  9: [
    "처음에는 운동을 시작하려고 샀는데 어느새 출퇴근길에도 가장 자주 신는 신발이 됐습니다.",
    "관리를 꾸준히 해서 전체적인 상태는 좋아요. 편하게 오래 신을 분과 만나면 좋겠습니다.",
  ],
}

export function createMockProductDetail(productId: number): ProductDetail | undefined {
  const product = mockProducts.find((item) => item.id === productId)
  if (!product || product.status !== "ON_SALE") {
    return undefined
  }

  const productStories = stories[productId] ?? [
    "깔끔하게 관리한 상품입니다. 사진에서 보이는 상태와 동일하며 편하게 신기 좋습니다.",
    "디테일과 착화감을 확인할 수 있도록 여러 각도에서 촬영했습니다.",
  ]

  return {
    productId: product.id,
    saleType: product.saleType,
    status: product.status,
    sellerId: 12 + product.id,
    images: [
      {
        sortOrder: 1,
        url: product.url,
        story: productStories[0],
      },
      {
        sortOrder: 2,
        url: product.id % 2 === 0
          ? "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=85"
          : "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=85",
        story: productStories[1],
      },
    ],
    name: product.name,
    brand: product.brand,
    price: product.price,
    modelNumber: `DEAR-${String(product.id).padStart(4, "0")}`,
    category: product.category ?? "SNEAKERS",
    releaseDate: "2026-02-03",
    viewCount: product.viewCount,
    description: productStories.join("\n\n"),
    insertedAt: "2026-07-28T09:00:00",
  }
}

export const offerStories = [
  {
    productId: 7,
    writer: "지윤",
    title: "면접 날 신고 최종 합격 받은 구두",
    excerpt: stories[7][0],
    offerCount: 7,
    image: mockProducts[6].url,
  },
  {
    productId: 8,
    writer: "민주",
    title: "혼자 걷던 여행의 러닝화",
    excerpt: stories[8][0],
    offerCount: 10,
    image: mockProducts[7].url,
  },
  {
    productId: 9,
    writer: "그림",
    title: "매일의 시작을 함께한 운동화",
    excerpt: stories[9][0],
    offerCount: 4,
    image: mockProducts[8].url,
  },
]
