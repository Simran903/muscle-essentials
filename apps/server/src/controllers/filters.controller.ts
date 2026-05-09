import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { listShopFilters } from "../services/product.service.js";

export async function getShopFilters(_req: Request, res: Response): Promise<void> {
  const data = await listShopFilters();
  sendSuccess(res, data, "");
}
