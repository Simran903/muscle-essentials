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

// Accepts either a resolved variantId (preferred) or the label tuple (legacy).
const addBody = z
  .object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).default(1),
    variantId: z.string().min(1).optional(),
    selectedFlavourLabel: z.string().max(100).optional(),
    selectedSizeLabel: z.string().max(100).optional(),
  })
  .refine(
    (b) =>
      b.variantId != null ||
      (b.selectedFlavourLabel != null && b.selectedSizeLabel != null),
    { message: "Provide either variantId or both flavour/size labels." },
  );

export async function postAddCartItem(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const body = addBody.parse(req.body);
  const cart = await addCartItem(
    userId,
    body.variantId
      ? {
          kind: "byVariantId",
          productId: body.productId,
          variantId: body.variantId,
          quantity: body.quantity,
        }
      : {
          kind: "byLabels",
          productId: body.productId,
          quantity: body.quantity,
          selectedFlavourLabel: body.selectedFlavourLabel ?? "",
          selectedSizeLabel: body.selectedSizeLabel ?? "",
        },
  );
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
