import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Store,
  Zap,
  X,
} from "lucide-react"
import { getSellerAccount } from "@/api/memberApi"
import { createProduct, uploadProductImages } from "@/api/productApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"
import type {
  CreateProductRequest,
  ProductCategory,
  ProductSaleType,
} from "@/types/product"

type ImageDraft = {
  id: string
  file: File
  previewUrl: string
  story: string
}

const categoryOptions: Array<{
  value: ProductCategory
  label: string
}> = [
  { value: "SNEAKERS", label: "스니커즈" },
  { value: "SPORTS_SHOES", label: "스포츠화" },
  { value: "DRESS_SHOES", label: "구두" },
  { value: "BOOTS", label: "부츠/워커" },
  { value: "SANDALS_SLIDES", label: "샌들/슬리퍼" },
  { value: "WINTER_SHOES", label: "패딩/퍼 신발" },
]

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
}).format(new Date())

export function ProductCreatePage() {
  const queryClient = useQueryClient()
  const loggedIn = isAuthenticated()
  const previewUrlsRef = useRef(new Set<string>())
  const [saleType, setSaleType] = useState<ProductSaleType>("IMMEDIATE")
  const [images, setImages] = useState<ImageDraft[]>([])
  const [brand, setBrand] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [modelNumber, setModelNumber] = useState("")
  const [category, setCategory] = useState<ProductCategory>("SNEAKERS")
  const [releaseDate, setReleaseDate] = useState("")
  const [description, setDescription] = useState("")
  const [formError, setFormError] = useState("")
  const [progressMessage, setProgressMessage] = useState("")
  const [completed, setCompleted] = useState(false)

  const sellerQuery = useQuery({
    queryKey: ["seller-account", "me"],
    queryFn: getSellerAccount,
    enabled: loggedIn,
  })

  useEffect(() => {
    const previewUrls = previewUrlsRef.current

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const createMutation = useMutation({
    mutationFn: async () => {
      setProgressMessage("이미지를 업로드하고 있어요")
      const uploadedImages = await uploadProductImages(
        images.map((image, index) => ({
          sortOrder: index + 1,
          file: image.file,
        }))
      )
      setProgressMessage("상품 정보를 등록하고 있어요")

      const request: CreateProductRequest = {
        saleType,
        productImageContents: uploadedImages.map((uploadedImage) => {
          const draft = images[uploadedImage.sortOrder - 1]

          return {
            sortOrder: uploadedImage.sortOrder,
            url: uploadedImage.url,
            story:
              saleType === "OFFER" ? draft.story.trim() || null : null,
          }
        }),
        brand: brand.trim(),
        name: name.trim(),
        price: Number(price),
        modelNumber: modelNumber.trim(),
        category,
        releaseDate: releaseDate || null,
        description: description.trim() || null,
      }

      await createProduct(request)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-products", "me"] })
      void queryClient.invalidateQueries({ queryKey: ["products"] })
      setCompleted(true)
      setProgressMessage("")
    },
    onError: () => {
      setProgressMessage("")
    },
  })

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ""

    if (images.length + selectedFiles.length > 5) {
      setFormError("상품 이미지는 최대 5장까지 등록할 수 있습니다.")
      return
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
    )

    if (invalidFile) {
      setFormError("JPG, PNG, WEBP 이미지를 장당 10MB 이하로 선택해 주세요.")
      return
    }

    const drafts = selectedFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      previewUrlsRef.current.add(previewUrl)

      return {
        id: crypto.randomUUID(),
        file,
        previewUrl,
        story: "",
      }
    })

    setImages((current) => [...current, ...drafts])
    setFormError("")
  }

  function removeImage(imageId: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === imageId)

      if (target) {
        URL.revokeObjectURL(target.previewUrl)
        previewUrlsRef.current.delete(target.previewUrl)
      }

      return current.filter((image) => image.id !== imageId)
    })
  }

  function updateStory(imageId: string, story: string) {
    setImages((current) =>
      current.map((image) =>
        image.id === imageId ? { ...image, story } : image
      )
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (images.length === 0) {
      setFormError("상품 이미지를 한 장 이상 등록해 주세요.")
      return
    }

    if (
      saleType === "OFFER" &&
      images.some((image) => image.story.trim().length === 0)
    ) {
      setFormError("오퍼 상품은 각 사진의 이야기를 모두 작성해 주세요.")
      return
    }

    if (Number(price) <= 0) {
      setFormError("판매 가격은 0원보다 커야 합니다.")
      return
    }

    setFormError("")
    createMutation.mutate()
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Store className="size-11 text-brand" />
        <p className="mt-5 text-base font-black">로그인 후 상품을 등록할 수 있어요.</p>
        <Link
          to="/login?redirect=/sell/products/new"
          className="mt-6 rounded-md bg-brand px-5 py-3 text-sm font-bold"
        >
          로그인하기
        </Link>
      </div>
    )
  }

  if (sellerQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand" />
      </div>
    )
  }

  if (sellerQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-black">판매자 정보를 확인하지 못했습니다.</p>
        <p className="mt-2 text-sm text-neutral-500">
          {getApiErrorMessage(sellerQuery.error)}
        </p>
        <Link to="/profile" className="mt-6 text-sm font-bold underline">
          마이페이지로 돌아가기
        </Link>
      </div>
    )
  }

  if (!sellerQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Store className="size-11 text-brand" />
        <h1 className="mt-5 text-lg font-black">판매자 등록이 먼저 필요합니다</h1>
        <p className="mt-2 text-sm text-neutral-500">
          정산 계좌를 등록한 뒤 상품을 판매할 수 있어요.
        </p>
        <Link
          to="/seller/register"
          className="mt-6 flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-black"
        >
          판매자 등록
          <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  if (completed) {
    return <ProductCreateComplete onCreateAnother={() => resetForm()} />
  }

  function resetForm() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrlsRef.current.clear()
    setSaleType("IMMEDIATE")
    setImages([])
    setBrand("")
    setName("")
    setPrice("")
    setModelNumber("")
    setCategory("SNEAKERS")
    setReleaseDate("")
    setDescription("")
    setFormError("")
    setCompleted(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-neutral-200 bg-white/96 px-3 backdrop-blur">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="뒤로가기"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-black">
          {saleType === "IMMEDIATE"
            ? "즉시구매 상품 등록"
            : "오퍼구매 상품 등록"}
        </h1>
      </header>

      <form
        className="mx-auto max-w-[760px] pb-28 md:py-8"
        onSubmit={handleSubmit}
      >
        <section className="border-y border-neutral-200 bg-white px-5 py-6 md:border md:px-7">
          <p className="text-xs font-bold text-neutral-400">SALE TYPE</p>
          <h2 className="mt-1 text-base font-black">어떻게 판매할까요?</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-neutral-100 p-1">
            <SaleTypeButton
              active={saleType === "IMMEDIATE"}
              label="즉시구매"
              description="예치금으로 바로 결제"
              onClick={() => setSaleType("IMMEDIATE")}
            />
            <SaleTypeButton
              active={saleType === "OFFER"}
              label="오퍼구매"
              description="이야기를 보고 판매자 선택"
              onClick={() => setSaleType("OFFER")}
            />
          </div>
          <SaleTypeIntro saleType={saleType} />
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-6 md:mt-4 md:border md:px-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-neutral-400">
                {saleType === "IMMEDIATE" ? "PRODUCT IMAGES" : "STORY IMAGES"}
              </p>
              <h2 className="mt-1 text-base font-black">
                {saleType === "IMMEDIATE"
                  ? "판매할 상품을 보여주세요"
                  : "이야기를 담을 사진을 올려주세요"}
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                {saleType === "IMMEDIATE"
                  ? "첫 번째 사진이 목록의 대표 이미지로 표시됩니다."
                  : "사진 순서대로 구매자에게 이야기와 함께 공개됩니다."}
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">
              {images.length}/5
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-md bg-neutral-100"
              >
                <img
                  src={image.previewUrl}
                  alt={`상품 이미지 ${index + 1}`}
                  className="size-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-brand px-1.5 py-0.5 text-[9px] font-black">
                    대표
                  </span>
                )}
                {saleType === "OFFER" && (
                  <span
                    className={`absolute bottom-1.5 left-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      image.story.trim()
                        ? "bg-neutral-950/80 text-white"
                        : "bg-white/90 text-neutral-700"
                    }`}
                  >
                    {image.story.trim() ? "이야기 완료" : "이야기 필요"}
                  </span>
                )}
                <button
                  type="button"
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-neutral-950/75 text-white"
                  aria-label={`${index + 1}번 이미지 삭제`}
                  onClick={() => removeImage(image.id)}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 hover:border-brand hover:text-neutral-950">
                <ImagePlus className="size-5" />
                <span className="text-[10px] font-bold">사진 추가</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  aria-label="상품 이미지 선택"
                  onChange={handleImageSelection}
                />
              </label>
            )}
          </div>
        </section>

        {saleType === "OFFER" && (
          <OfferStorySection images={images} onStoryChange={updateStory} />
        )}

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-6 md:mt-4 md:border md:px-7">
          <p className="text-xs font-bold text-neutral-400">PRODUCT INFO</p>
          <h2 className="mt-1 text-base font-black">
            {saleType === "IMMEDIATE"
              ? "즉시구매 상품 정보"
              : "오퍼 상품 기본 정보"}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProductField
              label="브랜드"
              value={brand}
              maxLength={150}
              placeholder="예: Nike"
              onChange={setBrand}
            />
            <ProductField
              label="상품명"
              value={name}
              maxLength={150}
              placeholder="상품명을 입력해 주세요"
              onChange={setName}
            />
            <ProductField
              label="모델번호"
              value={modelNumber}
              maxLength={100}
              placeholder="예: CW2288-001"
              onChange={setModelNumber}
            />
            <label className="block">
              <span className="mb-2 block text-xs font-bold">카테고리</span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProductCategory)
                }
                className="h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-brand"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold">
                {saleType === "IMMEDIATE" ? "즉시구매 가격" : "상품 기준 가격"}
              </span>
              <span className="relative block">
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="h-12 w-full rounded-md border border-neutral-300 px-3 pr-9 text-sm outline-none focus:border-brand"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="9999999999999"
                  placeholder="0"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                  원
                </span>
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold">
                발매일 <span className="font-normal text-neutral-400">(선택)</span>
              </span>
              <input
                value={releaseDate}
                onChange={(event) => setReleaseDate(event.target.value)}
                className="h-12 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-brand"
                type="date"
                max={today}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-bold">
              상세 설명 <span className="font-normal text-neutral-400">(선택)</span>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full resize-none rounded-md border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-brand"
              placeholder={
                saleType === "IMMEDIATE"
                  ? "상품 상태, 구성품, 구매 전 확인할 내용을 작성해 주세요"
                  : "사진별 이야기 외에 구매자가 알아야 할 상품 정보를 작성해 주세요"
              }
              maxLength={1000}
            />
            <span className="mt-1 block text-right text-[10px] text-neutral-400">
              {description.length}/1000
            </span>
          </label>
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-5 md:mt-4 md:border md:px-7">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-black">
                등록 상품은 {formatNextRelease()}에 공개됩니다.
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                공개 전에는 상품 정보가 제한적으로 표시되며 결제와 오퍼는
                공개 이후 가능합니다.
              </p>
            </div>
          </div>
        </section>

        {(formError || createMutation.isError) && (
          <p className="mx-5 mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 md:mx-0">
            {formError || getApiErrorMessage(createMutation.error)}
          </p>
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/97 p-3 backdrop-blur md:sticky md:mt-4 md:border">
          <button
            type="submit"
            className="mx-auto flex h-12 w-full max-w-[736px] items-center justify-center gap-2 rounded-md bg-brand text-sm font-black text-neutral-950 disabled:bg-neutral-200 disabled:text-neutral-400"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {createMutation.isPending
              ? progressMessage || "등록 중..."
              : `${saleType === "IMMEDIATE" ? "즉시구매" : "오퍼"} 상품 등록`}
          </button>
        </div>
      </form>
    </div>
  )
}

function SaleTypeIntro({
  saleType,
}: {
  saleType: ProductSaleType
}) {
  const immediate = saleType === "IMMEDIATE"

  return (
    <div className="mt-4 flex items-start gap-3 border-l-2 border-brand bg-[#fff7f2] px-4 py-3">
      {immediate ? (
        <Zap className="mt-0.5 size-5 shrink-0 fill-brand text-brand" />
      ) : (
        <BookOpenText className="mt-0.5 size-5 shrink-0 text-brand" />
      )}
      <div>
        <p className="text-sm font-black">
          {immediate ? "가격으로 바로 판매해요" : "상품의 이야기로 오퍼를 받아요"}
        </p>
        <p className="mt-1 text-xs leading-5 text-neutral-600">
          {immediate
            ? "공개 후 구매자가 표시된 가격으로 바로 결제할 수 있습니다."
            : "구매자는 모든 사진과 이야기를 확인한 뒤 판매자에게 오퍼를 보냅니다."}
        </p>
      </div>
    </div>
  )
}

function OfferStorySection({
  images,
  onStoryChange,
}: {
  images: ImageDraft[]
  onStoryChange: (imageId: string, story: string) => void
}) {
  return (
    <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-6 md:mt-4 md:border md:px-7">
      <div className="flex items-start gap-3">
        <BookOpenText className="mt-0.5 size-5 shrink-0 text-brand" />
        <div>
          <p className="text-xs font-bold text-neutral-400">PHOTO STORIES</p>
          <h2 className="mt-1 text-base font-black">사진마다 이야기를 들려주세요</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            구매자는 아래 순서대로 모든 이야기를 확인한 후 오퍼를 작성합니다.
          </p>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="mt-5 border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center">
          <ImagePlus className="mx-auto size-6 text-neutral-400" />
          <p className="mt-2 text-xs font-bold text-neutral-500">
            먼저 위에서 사진을 추가해 주세요.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {images.map((image, index) => (
            <label
              key={image.id}
              className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 border-b border-neutral-100 pb-5 last:border-0 last:pb-0"
            >
              <span className="block">
                <img
                  src={image.previewUrl}
                  alt={`이야기 ${index + 1} 상품 이미지`}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <span className="mt-1 block text-center text-[10px] font-bold text-neutral-400">
                  {index + 1}/{images.length}
                </span>
              </span>
              <span className="block">
                <span className="mb-1.5 flex items-center justify-between text-xs font-bold">
                  이야기 {index + 1}
                  <span className="font-normal text-neutral-400">
                    {image.story.length}/1000
                  </span>
                </span>
                <textarea
                  value={image.story}
                  onChange={(event) =>
                    onStoryChange(image.id, event.target.value)
                  }
                  className="min-h-24 w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm leading-6 outline-none focus:border-brand"
                  placeholder="사진에 담긴 기억과 상품의 이야기를 적어 주세요"
                  maxLength={1000}
                  required
                />
              </span>
            </label>
          ))}
        </div>
      )}
    </section>
  )
}

function SaleTypeButton({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`min-h-16 rounded-md px-3 py-2 text-left ${
        active
          ? "bg-white shadow-sm ring-1 ring-brand"
          : "text-neutral-500"
      }`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="block text-sm font-black">{label}</span>
      <span className="mt-1 block text-[10px]">{description}</span>
    </button>
  )
}

function ProductField({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  maxLength: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-brand"
        placeholder={placeholder}
        maxLength={maxLength}
        required
      />
    </label>
  )
}

function ProductCreateComplete({
  onCreateAnother,
}: {
  onCreateAnother: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4f1] px-5 py-10">
      <section className="w-full max-w-md border border-neutral-200 bg-white px-6 py-9 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="size-9" />
        </span>
        <h1 className="mt-5 text-xl font-black">상품 등록이 완료되었습니다</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          상품은 공개 예정 상태로 저장됐어요.
          <br />
          {formatNextRelease()}에 구매자에게 공개됩니다.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2">
          <Link
            to="/profile"
            className="flex h-11 items-center justify-center rounded-md border border-neutral-300 text-sm font-bold"
          >
            내 상품 보기
          </Link>
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-md bg-neutral-950 text-sm font-bold text-white"
            onClick={onCreateAnother}
          >
            상품 더 등록
          </button>
        </div>
      </section>
    </div>
  )
}

function formatNextRelease() {
  const now = new Date()
  const release = new Date(now)
  release.setHours(20, 0, 0, 0)

  if (now >= release) {
    release.setDate(release.getDate() + 1)
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(release)
}
