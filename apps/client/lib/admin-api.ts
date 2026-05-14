import axios, { isAxiosError } from "axios"

import { API_ORIGIN, bearerHeaders, type ApiEnvelope, type ProductDietType } from "./api"
import { getAccessToken } from "./auth-storage"

export type { ProductDietType }

const adminApi = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

function requireToken(): string {
  const t = getAccessToken()
  if (!t) throw new Error("Sign in required.")
  return t
}

function envelopeMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return fallback
  const data = err.response?.data as ApiEnvelope<unknown> | undefined
  if (typeof data?.error === "string") return data.error
  return typeof data?.message === "string" ? data.message : fallback
}

async function adminGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const token = requireToken()
  const { data: body } = await adminApi.get<ApiEnvelope<T>>(path, {
    headers: bearerHeaders(token),
    params: params
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
      : undefined,
  })
  if (body.data === undefined) {
    throw new Error(body.message ?? "Empty response.")
  }
  return body.data
}

async function adminSend<T>(
  method: "post" | "patch" | "put" | "delete",
  path: string,
  body?: unknown,
) {
  const token = requireToken()
  const { data: res } = await adminApi.request<ApiEnvelope<T>>({
    method,
    url: path,
    data: body,
    headers: bearerHeaders(token),
  })
  if (res.success === false) {
    throw new Error(res.message ?? "Request failed.")
  }
  return res.data as T
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminBrand = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  productCount?: number
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  productCount: number
}

export type AdminProductVariant = {
  id: string
  flavourLabel: string
  sizeLabel: string
  isActive: boolean
}

export type AdminVariantSpotlight = {
  id: string
  variantId: string
  /** Label snapshot from the variant for display in admin tables. */
  flavourLabel: string
  sizeLabel: string
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
}

export type AdminProduct = {
  id: string
  title: string
  slug: string
  sku: string
  shortDesc: string
  description: string
  currency: string
  flavours: { id: string; label: string; sortOrder: number }[]
  fromPrice: number | string
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
  dietType: ProductDietType
  categoryId: string | null
  brand: { id: string; name: string; slug: string } | null
  category: { id: string; name: string; slug: string } | null
  sizes: { id: string; label: string; sortOrder: number; price: number | string; costPrice: number | string }[]
  variants: AdminProductVariant[]
  variantSpotlights: AdminVariantSpotlight[]
}

export type AdminProductImage = {
  id: string
  productId: string
  url: string
  publicId: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
  width: number | null
  height: number | null
}

export type AdminOrderListItem = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number | string
  placedAt: string
  user: { id: string; email: string | null } | null
}

export type AdminUser = {
  id: string
  email: string | null
  name: string | null
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
}

export type AdminReview = {
  id: string
  productId: string
  variantId: string
  userId: string
  orderId: string | null
  rating: number
  title: string | null
  body: string | null
  /** Display labels sourced from the variant relation; safe across renames. */
  flavourLabel: string
  sizeLabel: string
  status: string
  adminNote: string | null
  createdAt: string
  updatedAt: string
  product: { id: string; title: string; slug: string }
  user: { id: string; email: string | null }
}

export async function adminListBrands(page = 1, limit = 50) {
  return adminGet<{ items: AdminBrand[]; pagination: Pagination }>("/api/admin/brands", {
    page,
    limit,
  })
}

export async function adminCreateBrand(body: {
  name: string
  description?: string | null
  isActive?: boolean
}) {
  return adminSend<{ brand: AdminBrand }>("post", "/api/admin/brands", body)
}

export async function adminUpdateBrand(
  id: string,
  body: Partial<{ name: string; description: string | null; isActive: boolean }>,
) {
  return adminSend<{ brand: AdminBrand }>("patch", `/api/admin/brands/${id}`, body)
}

export async function adminDeactivateBrand(id: string) {
  await adminSend<Record<string, never>>("delete", `/api/admin/brands/${id}`)
}

export async function adminListCategories(page = 1, limit = 50) {
  return adminGet<{ items: AdminCategory[]; pagination: Pagination }>("/api/admin/categories", {
    page,
    limit,
  })
}

export async function adminCreateCategory(body: { name: string; isActive?: boolean }) {
  return adminSend<{ category: AdminCategory }>("post", "/api/admin/categories", body)
}

export async function adminUpdateCategory(
  id: string,
  body: Partial<{ name: string; isActive: boolean }>,
) {
  return adminSend<{ category: AdminCategory }>("patch", `/api/admin/categories/${id}`, body)
}

export async function adminDeactivateCategory(id: string) {
  await adminSend<Record<string, never>>("delete", `/api/admin/categories/${id}`)
}

export async function adminListProducts(page = 1, limit = 50) {
  return adminGet<{ items: AdminProduct[]; pagination: Pagination }>("/api/admin/products", {
    page,
    limit,
  })
}

export async function adminGetProduct(id: string) {
  return adminGet<{ product: AdminProduct }>(`/api/admin/products/${id}`).then((r) => r.product)
}

export type AdminProductPayload = {
  title: string
  brandId: string
  categoryId?: string | null
  shortDesc: string
  description: string
  flavours?: string[]
  sizes: { label: string; price: string; costPrice?: string }[]
  stockQuantity: number
  currency: string
  isActive: boolean
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
  dietType: ProductDietType
}

export async function adminCreateProduct(body: AdminProductPayload) {
  return adminSend<{ product: { id: string } }>("post", "/api/admin/products", body)
}

export async function adminUpdateProduct(id: string, body: Partial<AdminProductPayload>) {
  return adminSend<{ product: { id: string } }>("patch", `/api/admin/products/${id}`, body)
}

export async function adminDeactivateProduct(id: string) {
  await adminSend<Record<string, never>>("delete", `/api/admin/products/${id}`)
}

export type VariantSpotlightInput = {
  /** Preferred: refer to an existing variant by id. */
  variantId?: string
  /** Legacy: refer to a variant by its label tuple. */
  flavourLabel?: string
  sizeLabel?: string
  isFeatured: boolean
  isBestseller: boolean
  isDealoftheDay: boolean
}

export async function adminPutVariantSpotlights(productId: string, spotlights: VariantSpotlightInput[]) {
  return adminSend<{ spotlights: AdminVariantSpotlight[] }>(
    "put",
    `/api/admin/products/${productId}/variant-spotlights`,
    { spotlights },
  )
}

export type SignedUploadPayload = {
  signature: string
  timestamp: number
  cloudName: string
  folder: string
  uploadUrl: string
}

export async function adminSignUpload(productId: string) {
  return adminSend<{ signed: SignedUploadPayload }>("post", "/api/admin/uploads/sign", {
    productId,
  }).then((r) => r.signed)
}

export async function adminListProductImages(productId: string) {
  return adminGet<{ images: AdminProductImage[] }>(`/api/admin/products/${productId}/images`).then(
    (r) => r.images,
  )
}

export async function adminAddProductImages(
  productId: string,
  images: Array<{
    publicId: string
    url: string
    width?: number
    height?: number
    bytes?: number
    format?: string
    altText?: string
    displayOrder?: number
    isPrimary?: boolean
  }>,
) {
  return adminSend<{ images: AdminProductImage[] }>("post", `/api/admin/products/${productId}/images`, {
    images,
  }).then((r) => r.images)
}

export async function adminPatchProductImage(
  productId: string,
  imageId: string,
  body: Partial<{ altText: string | null; sortOrder: number; isPrimary: boolean }>,
) {
  return adminSend<{ image: AdminProductImage }>(
    "patch",
    `/api/admin/products/${productId}/images/${imageId}`,
    body,
  ).then((r) => r.image)
}

export async function adminDeleteProductImage(productId: string, imageId: string) {
  await adminSend<Record<string, never>>("delete", `/api/admin/products/${productId}/images/${imageId}`)
}

export async function adminListOrders(page = 1, limit = 50) {
  return adminGet<{ items: AdminOrderListItem[]; pagination: Pagination }>("/api/admin/orders", {
    page,
    limit,
  })
}

export async function adminGetOrder(id: string) {
  return adminGet<{ order: unknown }>(`/api/admin/orders/${id}`).then((r) => r.order)
}

export async function adminPatchOrder(
  id: string,
  body: Partial<{ status: string; paymentStatus: string }>,
) {
  return adminSend<{ order: unknown }>("patch", `/api/admin/orders/${id}`, body)
}

export async function adminListUsers(page = 1, limit = 50) {
  return adminGet<{ items: AdminUser[]; pagination: Pagination }>("/api/admin/users", { page, limit })
}

export async function adminPatchUser(
  id: string,
  body: Partial<{ role: "CUSTOMER" | "ADMIN"; status: "ACTIVE" | "SUSPENDED" }>,
) {
  return adminSend<{ user: AdminUser }>("patch", `/api/admin/users/${id}`, body)
}

export async function adminListReviews(page = 1, limit = 50, status?: "PENDING" | "APPROVED" | "REJECTED") {
  return adminGet<{ items: AdminReview[]; pagination: Pagination }>("/api/admin/reviews", {
    page,
    limit,
    ...(status ? { status } : {}),
  })
}

export async function adminPatchReview(
  id: string,
  body: { status: "PENDING" | "APPROVED" | "REJECTED"; note?: string },
) {
  return adminSend<{ review: AdminReview }>("patch", `/api/admin/reviews/${id}`, body)
}

export function toAdminError(err: unknown, fallback: string): Error {
  return new Error(envelopeMessage(err, fallback))
}
