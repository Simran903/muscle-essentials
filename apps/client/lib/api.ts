import axios, { isAxiosError } from "axios"

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:5000"

const api = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
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

export type ProductItem = {
  id: string
  title: string
  createdAt: string
  slug: string
  shortDesc: string
  description: string
  flavours: { id: string; label: string; sortOrder: number }[]
  price: number | string
  currency: string
  stockQuantity: number
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
  sizes: { id: string; label: string; sortOrder: number }[]
  brand: { id: string; name: string; slug: string }
  category: { id: string; name: string; slug: string }
  images: { id: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean }[]
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

function bearerHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
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
    selectedFlavourLabel: string
    selectedSizeLabel: string
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
}): Promise<ProductListResponse> {
  try {
    const { data: body } = await api.get<ApiEnvelope<ProductListResponse>>("/api/products", {
      params: queryParams({
        page: params?.page,
        limit: params?.limit,
        categorySlug: params?.categorySlug,
        brandSlug: params?.brandSlug,
        featured: params?.featured,
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
    const { data: body } = await api.get<ApiEnvelope<ProductBySlugResponse>>(`/api/products/${slug}`)
    if (!body.data?.product) {
      throw new Error(body.message ?? "Unable to fetch product details.")
    }
    return body.data.product
  } catch (e) {
    throw toRequestError(e, "Unable to fetch product details.")
  }
}
