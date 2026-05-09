const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:5000"

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
  shortDesc: string | null
  description: string | null
  /** Comma-separated labels; use `flavours` for structured data. */
  flavour: string
  flavours: { id: string; label: string; sortOrder: number }[]
  price: number | string
  currency: string
  stockQuantity: number
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
  sizes: { id: string; label: string; sortOrder: number }[]
  brand: { id: string; name: string; slug: string } | null
  category: { id: string; name: string; slug: string } | null
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

export async function verifyDid(payload: VerifyDidPayload): Promise<string | null> {
  const response = await fetch(`${API_ORIGIN}/api/auth/verify-did`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const body: ApiEnvelope<VerifyDidData> = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.message ?? "Unable to verify details. Please try again.")
  }

  const accessToken = body.data?.accessToken
  return typeof accessToken === "string" && accessToken.length > 0 ? accessToken : null
}

export async function getMe(accessToken?: string | null): Promise<boolean> {
  const response = await fetch(`${API_ORIGIN}/api/auth/me`, {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
    credentials: "include",
  })

  return response.ok
}

export async function refreshSession(): Promise<string | null> {
  const response = await fetch(`${API_ORIGIN}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })

  const body: ApiEnvelope<RefreshData> = await response.json().catch(() => ({}))
  if (!response.ok) return null

  const accessToken = body.data?.accessToken
  return typeof accessToken === "string" && accessToken.length > 0 ? accessToken : null
}

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue
    query.set(key, String(value))
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export async function getProducts(params?: {
  page?: number
  limit?: number
  categorySlug?: string
  brandSlug?: string
  featured?: boolean
}): Promise<ProductListResponse> {
  const query = toQuery({
    page: params?.page,
    limit: params?.limit,
    categorySlug: params?.categorySlug,
    brandSlug: params?.brandSlug,
    featured: params?.featured,
  })

  const response = await fetch(`${API_ORIGIN}/api/products${query}`, {
    cache: "no-store",
  })
  const body: ApiEnvelope<ProductListResponse> = await response.json().catch(() => ({}))
  if (!response.ok || !body.data) {
    throw new Error(body.message ?? "Unable to fetch products.")
  }
  return body.data
}

export async function searchProducts(params: {
  q: string
  page?: number
  limit?: number
}): Promise<ProductListResponse> {
  const query = toQuery({
    q: params.q,
    page: params.page,
    limit: params.limit,
  })

  const response = await fetch(`${API_ORIGIN}/api/search${query}`, {
    cache: "no-store",
  })
  const body: ApiEnvelope<ProductListResponse> = await response.json().catch(() => ({}))
  if (!response.ok || !body.data) {
    throw new Error(body.message ?? "Unable to search products.")
  }
  return body.data
}

export async function getProductBySlug(slug: string): Promise<ProductItem> {
  const response = await fetch(`${API_ORIGIN}/api/products/${slug}`, {
    cache: "no-store",
  })
  const body: ApiEnvelope<ProductBySlugResponse> = await response.json().catch(() => ({}))
  if (!response.ok || !body.data?.product) {
    throw new Error(body.message ?? "Unable to fetch product details.")
  }
  return body.data.product
}
