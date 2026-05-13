import { prisma, type Prisma } from "database";
import { AppError } from "../utils/appError.js";
import { getProductIdBySlug, resolveVariant } from "./product.service.js";

type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    user: { select: { id: true; name: true } };
    variant: { select: { id: true; flavourLabel: true; sizeLabel: true } };
  };
}>;

type ReviewListFilter = {
  /** Restrict the listing to a specific variant. */
  variantId?: string;
};

/**
 * Lists approved reviews for a product, optionally narrowed to one variant.
 * The variant labels are surfaced via the `variant` relation so renames flow
 * through to the client without touching historical rows.
 */
export async function listApprovedReviewsForSlug(
  slug: string,
  filter: ReviewListFilter = {},
) {
  const productId = await getProductIdBySlug(slug);
  const where: Prisma.ReviewWhereInput = {
    productId,
    status: "APPROVED",
  };
  if (filter.variantId) where.variantId = filter.variantId;

  const reviews: ReviewWithRelations[] = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
      variant: { select: { id: true, flavourLabel: true, sizeLabel: true } },
    },
  });
  return reviews.map((r: ReviewWithRelations) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    variantId: r.variantId,
    flavourLabel: r.variant.flavourLabel,
    sizeLabel: r.variant.sizeLabel,
    createdAt: r.createdAt,
    user: { id: r.user.id, name: r.user.name },
  }));
}

type CreateReviewInput = {
  rating: number;
  title?: string;
  body?: string;
  /** Preferred: the resolved variant id from the PDP. */
  variantId?: string;
  /** Legacy: label tuple; the service resolves it to a variant. */
  flavourLabel?: string;
  sizeLabel?: string;
  orderId?: string;
};

/**
 * Creates a per-variant review. The user must have purchased that exact
 * variant (an `OrderItem` for it on any non-cancelled order) before being
 * allowed to review it. One review per (variant, user) is enforced by the
 * DB unique constraint.
 */
export async function createReview(
  userId: string,
  productSlug: string,
  input: CreateReviewInput,
) {
  const productId = await getProductIdBySlug(productSlug);

  // Resolve the target variant — by id when supplied, otherwise by labels.
  const variant = input.variantId
    ? await prisma.productVariant.findFirst({
        where: { id: input.variantId, productId },
      })
    : await resolveVariant(
        productId,
        (input.flavourLabel ?? "").trim(),
        (input.sizeLabel ?? "").trim(),
      );
  if (!variant) {
    throw new AppError("Invalid variant selection", 400);
  }

  // Ownership: the user must have at least one OrderItem for this variant on
  // a non-cancelled order. Cancelled orders don't count.
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      variantId: variant.id,
      order: {
        userId,
        status: { not: "CANCELLED" },
        ...(input.orderId ? { id: input.orderId } : {}),
      },
    },
    select: { id: true, orderId: true },
  });
  if (!orderItem) {
    throw new AppError(
      "You can only review a variant you've purchased",
      403,
    );
  }

  try {
    const review = await prisma.review.create({
      data: {
        productId,
        variantId: variant.id,
        userId,
        orderId: input.orderId ?? orderItem.orderId,
        rating: input.rating,
        title: input.title ?? null,
        body: input.body ?? null,
        status: "PENDING",
      },
    });
    return review;
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw new AppError("You already reviewed this variant", 409);
    }
    throw e;
  }
}
