import type { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utils/response.js";
import {
  addCartItem,
  getCartForUser,
  removeCartItem,
  updateCartItem,
} from "../services/cart.service.js";

export async function getCart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const cart = await getCartForUser(userId);
  sendSuccess(res, { cart }, "");
}

const addBody = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

export async function postAddCartItem(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const body = addBody.parse(req.body);
  const cart = await addCartItem(userId, body.productId, body.quantity);
  sendSuccess(res, { cart }, "Item added");
}

const patchBody = z.object({
  quantity: z.coerce.number().int().min(1),
});

export async function patchCartItem(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = patchBody.parse(req.body);
  const cart = await updateCartItem(userId, id, body.quantity);
  sendSuccess(res, { cart }, "Cart updated");
}

export async function deleteCartItem(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const cart = await removeCartItem(userId, id);
  sendSuccess(res, { cart }, "Item removed");
}
