import { prisma, type Prisma } from "database";
import { AppError } from "../utils/appError.js";
import { getProductIdBySlug } from "./product.service.js";

type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: { user: { select: { id: true; name: true } } };
}>;

export async function listApprovedReviewsForSlug(slug: string) {
  const productId = await getProductIdBySlug(slug);
  const reviews: ReviewWithUser[] = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
  return reviews.map((r: ReviewWithUser) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    user: { id: r.user.id, name: r.user.name },
  }));
}

export async function createReview(
  userId: string,
  productSlug: string,
  input: { rating: number; title?: string; body?: string; orderId?: string },
) {
  const productId = await getProductIdBySlug(productSlug);

  if (input.orderId) {
    const order = await prisma.order.findFirst({
      where: {
        id: input.orderId,
        userId,
        items: { some: { productId } },
      },
    });
    if (!order) {
      throw new AppError("Order does not include this product", 400);
    }
  }

  try {
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        orderId: input.orderId ?? null,
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
      throw new AppError("You already reviewed this product", 409);
    }
    throw e;
  }
}
