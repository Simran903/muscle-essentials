import type { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utils/response.js";
import {
  getProductBySlug,
  listByBrandSlug,
  listByCategorySlug,
  listProducts,
  searchProducts,
} from "../services/product.service.js";

const pagination = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export async function getProducts(req: Request, res: Response): Promise<void> {
  const q = pagination.parse(req.query);
  const categorySlug =
    typeof req.query.categorySlug === "string"
      ? req.query.categorySlug
      : undefined;
  const brandSlug =
    typeof req.query.brandSlug === "string" ? req.query.brandSlug : undefined;
  const featured =
    req.query.featured === "1" || req.query.featured === "true"
      ? true
      : undefined;

  const data = await listProducts({
    page: q.page,
    limit: q.limit,
    categorySlug,
    brandSlug,
    featured,
  });
  sendSuccess(res, data, "");
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.params);
  const product = await getProductBySlug(slug);
  sendSuccess(res, { product }, "");
}

export async function getCategoryProducts(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.params);
  const q = pagination.parse(req.query);
  const data = await listByCategorySlug(slug, q.page, q.limit);
  sendSuccess(res, data, "");
}

export async function getBrandProducts(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.params);
  const q = pagination.parse(req.query);
  const data = await listByBrandSlug(slug, q.page, q.limit);
  sendSuccess(res, data, "");
}

export async function getSearch(req: Request, res: Response): Promise<void> {
  const q = z
    .object({
      q: z.string().min(1),
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
    })
    .parse(req.query);
  const data = await searchProducts(q.q, q.page, q.limit);
  sendSuccess(res, data, "");
}
