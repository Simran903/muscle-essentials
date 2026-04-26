import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { checkoutSummary } from "../services/checkout.service.js";

export async function postCheckout(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const summary = await checkoutSummary(userId);
  sendSuccess(res, summary, "");
}
