import type { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utils/response.js";
import {
  createReview,
  listApprovedReviewsForSlug,
} from "../services/review.service.js";

const listQuery = z.object({
  variantId: z.string().optional(),
});

export async function getProductReviews(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.params);
  const q = listQuery.parse(req.query);
  const reviews = await listApprovedReviewsForSlug(slug, {
    variantId: q.variantId,
  });
  sendSuccess(res, { reviews }, "");
}

const postBody = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  variantId: z.string().min(1).optional(),
  // Legacy / fallback path: the service resolves these to a variantId.
  flavourLabel: z.string().max(200).optional(),
  sizeLabel: z.string().max(200).optional(),
  orderId: z.string().optional(),
});

export async function postProductReview(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.params);
  const body = postBody.parse(req.body);
  const review = await createReview(userId, slug, body);
  sendSuccess(res, { review }, "Review submitted");
}
