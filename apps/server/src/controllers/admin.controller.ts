import type { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utils/response.js";
import {
  adminAddProductImages,
  adminCreateBrand,
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteBrand,
  adminDeleteCategory,
  adminDeleteProduct,
  adminDeleteProductImage,
  adminGetOrder,
  adminGetProduct,
  adminListBrands,
  adminListCategories,
  adminListOrders,
  adminListProductImages,
  adminListProducts,
  adminListReviews,
  adminListUsers,
  adminModerateReview,
  adminRequireProduct,
  adminUpdateBrand,
  adminUpdateCategory,
  adminUpdateOrder,
  adminUpdateProduct,
  adminUpdateProductImage,
  adminUpdateUser,
  adminSetProductVariantSpotlights,
} from "../services/admin.service.js";
import { signProductImageUpload } from "../services/upload.service.js";

const pagination = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const orderStatus = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

const paymentStatus = z.enum([
  "PENDING",
  "REQUIRES_ACTION",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

const userRole = z.enum(["CUSTOMER", "ADMIN"]);
const userStatus = z.enum(["ACTIVE", "SUSPENDED"]);
const reviewStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export async function adminGetBrands(
  req: Request,
  res: Response,
): Promise<void> {
  const q = pagination.parse(req.query);
  const data = await adminListBrands(q.page, q.limit);
  sendSuccess(res, data, "");
}

export async function adminGetProducts(
  req: Request,
  res: Response,
): Promise<void> {
  const q = pagination.parse(req.query);
  const data = await adminListProducts(q.page, q.limit);
  sendSuccess(res, data, "");
}

export async function adminGetProductDetail(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const product = await adminGetProduct(id);
  sendSuccess(res, { product }, "");
}

const sizeTier = z.object({
  label: z.string().trim().min(1).max(100),
  price: z.string().min(1),
  costPrice: z.string().min(1).optional(),
});

const createProductBody = z.object({
  title: z.string().min(1),
  brandId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  shortDesc: z.string(),
  description: z.string(),
  flavours: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  sizes: z.array(sizeTier).min(1),
  stockQuantity: z.coerce.number().int().min(0),
  currency: z.string().min(1),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
  isDealoftheDay: z.boolean(),
});

export async function adminPostProduct(
  req: Request,
  res: Response,
): Promise<void> {
  const body = createProductBody.parse(req.body);
  const product = await adminCreateProduct(body);
  sendSuccess(res, { product }, "Product created");
}

const patchProductBody = createProductBody.partial().extend({
  sizes: z.array(sizeTier).min(1).optional(),
});

export async function adminPatchProduct(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = patchProductBody.parse(req.body);
  const product = await adminUpdateProduct(id, body);
  sendSuccess(res, { product }, "Product updated");
}

const variantSpotlightRow = z
  .object({
    variantId: z.string().min(1).optional(),
    flavourLabel: z.string().optional(),
    sizeLabel: z.string().max(100).optional(),
    isFeatured: z.boolean(),
    isBestseller: z.boolean(),
    isDealoftheDay: z.boolean(),
  })
  .refine(
    (r) =>
      r.variantId != null || (r.flavourLabel != null && r.sizeLabel != null),
    { message: "Provide variantId or both flavour/size labels." },
  );

const putVariantSpotlightsBody = z.object({
  spotlights: z.array(variantSpotlightRow).max(200),
});

export async function adminPutProductVariantSpotlights(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = putVariantSpotlightsBody.parse(req.body);
  const spotlights = await adminSetProductVariantSpotlights(id, body.spotlights);
  sendSuccess(res, { spotlights }, "Variant spotlights updated");
}

export async function adminRemoveProduct(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  await adminDeleteProduct(id);
  sendSuccess(res, {}, "Product deactivated");
}

const signUploadBody = z.object({
  productId: z.string().min(1),
});

export async function adminSignUpload(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = signUploadBody.parse(req.body);
  await adminRequireProduct(productId);
  const signed = signProductImageUpload(productId);
  sendSuccess(res, { signed }, "");
}

export async function adminGetProductImages(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const images = await adminListProductImages(id);
  sendSuccess(res, { images }, "");
}

const assetMeta = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
  format: z.string().optional(),
  altText: z.string().max(200).optional(),
  displayOrder: z.number().int().min(0).max(19).optional(),
  isPrimary: z.boolean().optional(),
});

const addImagesBody = z.object({
  images: z.array(assetMeta).min(1).max(20),
});

export async function adminPostProductImages(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = addImagesBody.parse(req.body);
  const images = await adminAddProductImages(id, body.images);
  sendSuccess(res, { images }, "Images saved");
}

const patchProductImageBody = z.object({
  altText: z.string().max(200).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

export async function adminPatchProductImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { id, imageId } = z
    .object({ id: z.string().min(1), imageId: z.string().min(1) })
    .parse(req.params);
  const body = patchProductImageBody.parse(req.body);
  const image = await adminUpdateProductImage(id, imageId, body);
  sendSuccess(res, { image }, "Image updated");
}

export async function adminRemoveProductImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { id, imageId } = z
    .object({ id: z.string().min(1), imageId: z.string().min(1) })
    .parse(req.params);
  await adminDeleteProductImage(id, imageId);
  sendSuccess(res, {}, "Image removed");
}

const createBrandBody = z.object({
  name: z.string().min(1),
  description: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function adminPostBrand(
  req: Request,
  res: Response,
): Promise<void> {
  const body = createBrandBody.parse(req.body);
  const brand = await adminCreateBrand(body);
  sendSuccess(res, { brand }, "Brand created");
}

const patchBrandBody = z.object({
  name: z.string().min(1).optional(),
  description: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function adminPatchBrand(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = patchBrandBody.parse(req.body);
  const brand = await adminUpdateBrand(id, body);
  sendSuccess(res, { brand }, "Brand updated");
}

export async function adminRemoveBrand(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  await adminDeleteBrand(id);
  sendSuccess(res, {}, "Brand deactivated");
}

export async function adminGetCategories(
  req: Request,
  res: Response,
): Promise<void> {
  const q = pagination.parse(req.query);
  const data = await adminListCategories(q.page, q.limit);
  sendSuccess(res, data, "");
}

const createCategoryBody = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  isActive: z.boolean().optional(),
});

export async function adminPostCategory(
  req: Request,
  res: Response,
): Promise<void> {
  const body = createCategoryBody.parse(req.body);
  const category = await adminCreateCategory(body);
  sendSuccess(res, { category }, "Category created");
}

const patchCategoryBody = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function adminPatchCategory(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = patchCategoryBody.parse(req.body);
  const category = await adminUpdateCategory(id, body);
  sendSuccess(res, { category }, "Category updated");
}

export async function adminRemoveCategory(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  await adminDeleteCategory(id);
  sendSuccess(res, {}, "Category deactivated");
}

export async function adminGetOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const q = pagination.parse(req.query);
  const data = await adminListOrders(q.page, q.limit);
  sendSuccess(res, data, "");
}

export async function adminGetOrderById(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const order = await adminGetOrder(id);
  sendSuccess(res, { order }, "");
}

const patchOrderBody = z.object({
  status: orderStatus.optional(),
  paymentStatus: paymentStatus.optional(),
});

export async function adminPatchOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = patchOrderBody.parse(req.body);
  const order = await adminUpdateOrder(id, body);
  sendSuccess(res, { order }, "Order updated");
}

export async function adminGetUsers(
  req: Request,
  res: Response,
): Promise<void> {
  const q = pagination.parse(req.query);
  const data = await adminListUsers(q.page, q.limit);
  sendSuccess(res, data, "");
}

const patchUserBody = z.object({
  role: userRole.optional(),
  status: userStatus.optional(),
});

export async function adminPatchUser(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = patchUserBody.parse(req.body);
  const user = await adminUpdateUser(id, body);
  sendSuccess(res, { user }, "User updated");
}

export async function adminGetReviews(
  req: Request,
  res: Response,
): Promise<void> {
  const q = pagination
    .extend({
      status: reviewStatus.optional(),
    })
    .parse(req.query);
  const data = await adminListReviews(q.page, q.limit, q.status);
  sendSuccess(res, data, "");
}

const moderateBody = z.object({
  status: reviewStatus,
  note: z.string().max(2000).optional(),
});

export async function adminPatchReview(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = moderateBody.parse(req.body);
  const review = await adminModerateReview(
    id,
    req.user!.id,
    body.status,
    body.note,
  );
  sendSuccess(res, { review }, "Review updated");
}
