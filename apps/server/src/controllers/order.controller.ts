import type { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utils/response.js";
import {
  createOrderFromCart,
  getOrderByIdForUser,
  listOrdersForUser,
} from "../services/order.service.js";

const createBody = z.object({
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().min(1).optional(),
});

export async function postOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const body = createBody.parse(req.body);
  const order = await createOrderFromCart(
    userId,
    body.shippingAddressId,
    body.billingAddressId,
  );
  sendSuccess(res, { order }, "Order placed");
}

export async function getOrders(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const orders = await listOrdersForUser(userId);
  sendSuccess(res, { orders }, "");
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const order = await getOrderByIdForUser(userId, id);
  sendSuccess(res, { order }, "");
}
