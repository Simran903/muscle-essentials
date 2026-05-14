import axios, { isAxiosError } from "axios"

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:5000"

const api = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  error?: string
  data?: T
}

type VerifyDidPayload = {
  didToken: string
  email: string
  phone: string
}

type VerifyDidData = {
  accessToken?: string
}

type RefreshData = {
  accessToken?: string
}

type ProductBySlugResponse = {
  product: ProductItem
}

export type ProductDietType = "VEG" | "NON_VEG"

export type ProductReviewItem = {
  id: string
  rating: number
  title: string | null
  body: string | null
  /** The variant entity the reviewer purchased. */
  variantId: string
  /** Label snapshot from the variant; empty when the product has no flavours. */
  flavourLabel: string
  /** Label snapshot from the variant; empty when the product has no sizes. */
  sizeLabel: string
  createdAt: string
  user: { id: string; name: string | null }
}

type ProductReviewsResponse = {
  reviews: ProductReviewItem[]
}

export type ProductVariant = {
  id: string
  flavourLabel: string
  sizeLabel: string
  isActive: boolean
}

export type ProductVariantSpotlight = {
  variantId: string
  flavourLabel: string
  sizeLabel: string
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
}

export type ProductItem = {
  id: string
  title: string
  createdAt: string
  slug: string
  shortDesc: string
  description: string
  flavours: { id: string; label: string; sortOrder: number }[]
  /** Lowest size-tier price (listings, cards, sort). */
  price: number | string
  /** Present when size tiers have different selling prices. */
  maxPrice?: number | string
  currency: string
  stockQuantity: number
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
  /** Veg vs non-veg classification (store policy / regulatory labeling). */
  dietType: ProductDietType
  /** Canonical purchasable variants; labels are mirrors of `flavours`/`sizes`. */
  variants?: ProductVariant[]
  /** Per-variant merchandising overrides; keyed by `variantId`. */
  variantSpotlights?: ProductVariantSpotlight[]
  sizes: { id: string; label: string; sortOrder: number; price: number | string }[]
  brand: { id: string; name: string; slug: string }
  category: { id: string; name: string; slug: string }
  images: { id: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean }[]
}

/**
 * Resolves a `(flavour, size)` label tuple to a `variantId` for a product.
 * Returns `null` when no matching active variant exists yet (eg. the user
 * hasn't completed selection on a multi-variant product).
 */
export function resolveVariantId(
  product: Pick<ProductItem, "variants" | "flavours" | "sizes">,
  flavourLabel: string | null | undefined,
  sizeLabel: string | null | undefined,
): string | null {
  const variants = product.variants ?? []
  if (variants.length === 0) return null
  const hasFlavours = (product.flavours?.length ?? 0) > 0
  const hasSizes = (product.sizes?.length ?? 0) > 0
  const fl = hasFlavours ? (flavourLabel ?? "").trim() : ""
  const sz = hasSizes ? (sizeLabel ?? "").trim() : ""
  if (hasFlavours && !fl) return null
  if (hasSizes && !sz) return null
  const match = variants.find(
    (v) => v.flavourLabel === fl && v.sizeLabel === sz && v.isActive,
  )
  return match?.id ?? null
}

function normalizeSpotlightFlavour(
  flavourLabel: string | null | undefined,
  productHasFlavours: boolean,
): string {
  if (!productHasFlavours) return ""
  return (flavourLabel ?? "").trim()
}

export function getVariantSpotlightRow(
  product: Pick<ProductItem, "variantSpotlights" | "flavours" | "variants" | "sizes">,
  flavourLabel: string | null | undefined,
  sizeLabel: string | null | undefined,
): ProductVariantSpotlight | undefined {
  const spotlights = product.variantSpotlights ?? []
  if (!spotlights.length) return undefined
  const variantId = resolveVariantId(product, flavourLabel, sizeLabel)
  if (variantId) {
    const byId = spotlights.find((s) => s.variantId === variantId)
    if (byId) return byId
  }
  const sz = (sizeLabel ?? "").trim()
  if (!sz) return undefined
  const fl = normalizeSpotlightFlavour(
    flavourLabel,
    (product.flavours?.length ?? 0) > 0,
  )
  return spotlights.find((s) => s.sizeLabel === sz && s.flavourLabel === fl)
}

export function effectiveVariantFlags(
  product: ProductItem,
  flavourLabel: string | null | undefined,
  sizeLabel: string | null | undefined,
): {
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
} {
  const row = getVariantSpotlightRow(product, flavourLabel, sizeLabel)
  return {
    isFeatured: product.isFeatured || Boolean(row?.isFeatured),
    isBestseller: product.isBestseller || Boolean(row?.isBestseller),
    isDealoftheDay: product.isDealoftheDay || Boolean(row?.isDealoftheDay),
  }
}

export function productQualifiesForMerchFlag(
  product: ProductItem,
  key: "isFeatured" | "isBestseller" | "isDealoftheDay",
): boolean {
  if (product[key]) return true
  const spotlightKey =
    key === "isFeatured"
      ? "isFeatured"
      : key === "isBestseller"
        ? "isBestseller"
        : "isDealoftheDay"
  return (product.variantSpotlights ?? []).some((s) => s[spotlightKey])
}

export type ProductListResponse = {
  items: ProductItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ShopFilters = {
  brands: { slug: string; name: string }[]
  categories: { slug: string; name: string }[]
  flavours: { label: string }[]
}

function envelopeMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return fallback
  const data = err.response?.data as ApiEnvelope<unknown> | undefined
  return typeof data?.message === "string" ? data.message : fallback
}

function toRequestError(e: unknown, fallback: string): Error {
  if (e instanceof Error && !isAxiosError(e)) return e
  return new Error(envelopeMessage(e, fallback))
}

export function bearerHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
}

export async function fetchAuthUser(accessToken: string): Promise<AuthUser | null> {
  try {
    const { data: body } = await api.get<ApiEnvelope<{ user: AuthUser }>>("/api/auth/me", {
      headers: bearerHeaders(accessToken),
    })
    return body.data?.user ?? null
  } catch {
    return null
  }
}

export type CartProductSummary = {
  id: string
  title: string
  slug: string
  sku: string
  stockQuantity: number
  isActive: boolean
  /** Primary image if set, else first gallery image by sort order. */
  imageUrl: string | null
  imageAlt: string | null
}

export type CartLineItem = {
  id: string
  quantity: number
  /** Variant entity this line is bound to. */
  variantId: string
  /** Display label sourced from the variant (kept in sync with catalog renames). */
  selectedFlavourLabel: string
  selectedSizeLabel: string
  unitPrice: number | string
  lineTotal: number | string
  product: CartProductSummary
}

export type Cart = {
  id: string
  status: string
  currency: string
  subtotalAmount: number | string
  discountAmount: number | string
  totalAmount: number | string
  items: CartLineItem[]
}

export async function fetchCart(accessToken: string): Promise<Cart> {
  try {
    const { data: body } = await api.get<ApiEnvelope<{ cart: Cart }>>("/api/cart", {
      headers: bearerHeaders(accessToken),
    })
    if (!body.data?.cart) {
      throw new Error(body.message ?? "Unable to load cart.")
    }
    return body.data.cart
  } catch (e) {
    throw toRequestError(e, "Unable to load cart.")
  }
}

export async function addToCart(
  accessToken: string,
  payload: {
    productId: string
    quantity: number
    /** Preferred: resolved variant id from the PDP variant picker. */
    variantId?: string
    /** Legacy: variant labels; the server resolves them to a variantId. */
    selectedFlavourLabel?: string
    selectedSizeLabel?: string
  },
): Promise<Cart> {
  try {
    const { data: body } = await api.post<ApiEnvelope<{ cart: Cart }>>(
      "/api/cart/add",
      payload,
      { headers: bearerHeaders(accessToken) },
    )
    if (!body.data?.cart) {
      throw new Error(body.message ?? "Unable to add to cart.")
    }
    return body.data.cart
  } catch (e) {
    throw toRequestError(e, "Unable to add to cart.")
  }
}

export async function updateCartLineQuantity(
  accessToken: string,
  itemId: string,
  quantity: number,
): Promise<Cart> {
  try {
    const { data: body } = await api.patch<ApiEnvelope<{ cart: Cart }>>(
      `/api/cart/item/${itemId}`,
      { quantity },
      { headers: bearerHeaders(accessToken) },
    )
    if (!body.data?.cart) {
      throw new Error(body.message ?? "Unable to update cart.")
    }
    return body.data.cart
  } catch (e) {
    throw toRequestError(e, "Unable to update cart.")
  }
}

export async function removeCartLine(accessToken: string, itemId: string): Promise<Cart> {
  try {
    const { data: body } = await api.delete<ApiEnvelope<{ cart: Cart }>>(
      `/api/cart/item/${itemId}`,
      { headers: bearerHeaders(accessToken) },
    )
    if (!body.data?.cart) {
      throw new Error(body.message ?? "Unable to remove item.")
    }
    return body.data.cart
  } catch (e) {
    throw toRequestError(e, "Unable to remove item.")
  }
}

export async function verifyDid(payload: VerifyDidPayload): Promise<string | null> {
  try {
    const { data: body } = await api.post<ApiEnvelope<VerifyDidData>>("/api/auth/verify-did", payload)
    const accessToken = body.data?.accessToken
    return typeof accessToken === "string" && accessToken.length > 0 ? accessToken : null
  } catch (e) {
    throw new Error(envelopeMessage(e, "Unable to verify details. Please try again."))
  }
}

export async function getMe(accessToken?: string | null): Promise<boolean> {
  try {
    await api.get("/api/auth/me", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
    return true
  } catch {
    return false
  }
}

export async function refreshSession(): Promise<string | null> {
  try {
    const { data: body } = await api.post<ApiEnvelope<RefreshData>>("/api/auth/refresh", {})
    const accessToken = body.data?.accessToken
    return typeof accessToken === "string" && accessToken.length > 0 ? accessToken : null
  } catch {
    return null
  }
}

/**
 * Calls the server-side logout to invalidate the refresh session cookie.
 * Local access-token cleanup is the caller's responsibility (handled via
 * `clearAccessToken()` from `lib/auth-storage`).
 */
export async function logoutSession(): Promise<void> {
  try {
    await api.post<ApiEnvelope<unknown>>("/api/auth/logout", {})
  } catch {
    // Server-side logout is best-effort; the access token gets cleared
    // locally regardless so the user is effectively signed out.
  }
}

export type AccountOrderItem = {
  id: string
  quantity: number
  unitPrice: number | string
  lineTotal: number | string
  productTitle: string
  productSku: string
  selectedFlavourLabel: string
  selectedSizeLabel: string
}

export type AccountOrder = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  currency: string
  subtotalAmount: number | string
  shippingAmount: number | string
  discountAmount: number | string
  taxAmount: number | string
  totalAmount: number | string
  placedAt: string
  items: AccountOrderItem[]
}

export type AccountAddress = {
  id: string
  label: string | null
  fullName: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string
  countryCode: string
  phone: string | null
  type: "SHIPPING" | "BILLING" | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export async function getAccountOrders(accessToken: string): Promise<AccountOrder[]> {
  try {
    const { data: body } = await api.get<ApiEnvelope<{ orders: AccountOrder[] }>>(
      "/api/account/orders",
      { headers: bearerHeaders(accessToken) },
    )
    return body.data?.orders ?? []
  } catch {
    return []
  }
}

export async function getAccountAddresses(
  accessToken: string,
): Promise<AccountAddress[]> {
  try {
    const { data: body } = await api.get<
      ApiEnvelope<{ addresses: AccountAddress[] }>
    >("/api/account/addresses", { headers: bearerHeaders(accessToken) })
    return body.data?.addresses ?? []
  } catch {
    return []
  }
}

export type AddressInput = {
  label?: string | null
  fullName: string
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  countryCode: string
  phone?: string | null
  type?: "SHIPPING" | "BILLING" | null
  isDefault?: boolean
}

export async function createAccountAddress(
  accessToken: string,
  input: AddressInput,
): Promise<AccountAddress> {
  try {
    const { data: body } = await api.post<
      ApiEnvelope<{ address: AccountAddress }>
    >("/api/account/addresses", input, { headers: bearerHeaders(accessToken) })
    if (!body.data?.address) {
      throw new Error(body.message ?? "Unable to save address.")
    }
    return body.data.address
  } catch (e) {
    throw toRequestError(e, "Unable to save address.")
  }
}

export async function updateAccountAddress(
  accessToken: string,
  id: string,
  input: Partial<AddressInput>,
): Promise<AccountAddress> {
  try {
    const { data: body } = await api.patch<
      ApiEnvelope<{ address: AccountAddress }>
    >(`/api/account/addresses/${encodeURIComponent(id)}`, input, {
      headers: bearerHeaders(accessToken),
    })
    if (!body.data?.address) {
      throw new Error(body.message ?? "Unable to update address.")
    }
    return body.data.address
  } catch (e) {
    throw toRequestError(e, "Unable to update address.")
  }
}

export async function deleteAccountAddress(
  accessToken: string,
  id: string,
): Promise<void> {
  try {
    await api.delete<ApiEnvelope<unknown>>(
      `/api/account/addresses/${encodeURIComponent(id)}`,
      { headers: bearerHeaders(accessToken) },
    )
  } catch (e) {
    throw toRequestError(e, "Unable to delete address.")
  }
}

function queryParams(record: Record<string, string | number | boolean | undefined>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, v]) => v !== undefined && v !== ""),
  ) as Record<string, string | number | boolean>
}

export async function getShopFilters(): Promise<ShopFilters> {
  try {
    const { data: body } = await api.get<ApiEnvelope<ShopFilters>>("/api/filters")
    if (!body.data) {
      throw new Error(body.message ?? "Unable to fetch shop filters.")
    }
    return body.data
  } catch (e) {
    throw toRequestError(e, "Unable to fetch shop filters.")
  }
}

export async function getProducts(params?: {
  page?: number
  limit?: number
  categorySlug?: string
  brandSlug?: string
  featured?: boolean
  bestseller?: boolean
  dealOfTheDay?: boolean
}): Promise<ProductListResponse> {
  try {
    const { data: body } = await api.get<ApiEnvelope<ProductListResponse>>("/api/products", {
      params: queryParams({
        page: params?.page,
        limit: params?.limit,
        categorySlug: params?.categorySlug,
        brandSlug: params?.brandSlug,
        featured: params?.featured,
        bestseller: params?.bestseller,
        deal: params?.dealOfTheDay === true ? true : undefined,
      }),
    })
    if (!body.data) {
      throw new Error(body.message ?? "Unable to fetch products.")
    }
    return body.data
  } catch (e) {
    throw toRequestError(e, "Unable to fetch products.")
  }
}

export async function searchProducts(params: {
  q: string
  page?: number
  limit?: number
}): Promise<ProductListResponse> {
  try {
    const { data: body } = await api.get<ApiEnvelope<ProductListResponse>>("/api/search", {
      params: queryParams({
        q: params.q,
        page: params.page,
        limit: params.limit,
      }),
    })
    if (!body.data) {
      throw new Error(body.message ?? "Unable to search products.")
    }
    return body.data
  } catch (e) {
    throw toRequestError(e, "Unable to search products.")
  }
}

export async function getProductBySlug(slug: string): Promise<ProductItem> {
  try {
    const { data: body } = await api.get<ApiEnvelope<ProductBySlugResponse>>(
      `/api/products/${encodeURIComponent(slug)}`,
    )
    if (!body.data?.product) {
      throw new Error(body.message ?? "Unable to fetch product details.")
    }
    return body.data.product
  } catch (e) {
    throw toRequestError(e, "Unable to fetch product details.")
  }
}

/**
 * Approved reviews for the PDP. When `variantId` is supplied the list is
 * narrowed to that specific variant; otherwise all approved reviews for the
 * product are returned.
 */
export async function getProductReviews(
  slug: string,
  options: { variantId?: string } = {},
): Promise<ProductReviewItem[]> {
  try {
    const { data: body } = await api.get<ApiEnvelope<ProductReviewsResponse>>(
      `/api/products/${encodeURIComponent(slug)}/reviews`,
      { params: queryParams({ variantId: options.variantId }) },
    )
    return body.data?.reviews ?? []
  } catch {
    return []
  }
}

export type SubmitReviewInput = {
  rating: number
  title?: string
  body?: string
  /** Preferred: resolved variant id from the PDP variant picker. */
  variantId?: string
  /** Legacy fallback: labels resolved server-side when `variantId` is absent. */
  flavourLabel?: string
  sizeLabel?: string
  orderId?: string
}

export type SubmitReviewResult =
  | { ok: true }
  | {
      ok: false
      reason: "auth" | "duplicate" | "not-purchased" | "validation" | "error"
      message?: string
    }

/** POSTs a review for the given product slug. Returns a structured outcome instead of throwing. */
export async function submitProductReview(
  accessToken: string,
  slug: string,
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  try {
    await api.post<ApiEnvelope<{ review: unknown }>>(
      `/api/products/${encodeURIComponent(slug)}/reviews`,
      input,
      { headers: bearerHeaders(accessToken) },
    )
    return { ok: true }
  } catch (e) {
    if (isAxiosError(e)) {
      const status = e.response?.status
      const message = envelopeMessage(e, "Unable to submit review.")
      if (status === 401) return { ok: false, reason: "auth", message }
      if (status === 403) return { ok: false, reason: "not-purchased", message }
      if (status === 409) return { ok: false, reason: "duplicate", message }
      if (status === 400) return { ok: false, reason: "validation", message }
      return { ok: false, reason: "error", message }
    }
    return {
      ok: false,
      reason: "error",
      message: e instanceof Error ? e.message : "Unable to submit review.",
    }
  }
}
