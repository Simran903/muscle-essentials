import type { Request, Response } from "express";
import { type AddressType, prisma } from "database";
import { z } from "zod";
import { sendSuccess } from "../utils/response.js";
import { listOrdersForUser } from "../services/order.service.js";
import {
  createAddressForUser,
  deleteAddressForUser,
  listAddressesForUser,
  updateAddressForUser,
} from "../services/account.service.js";

export async function getAccount(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  sendSuccess(res, { user }, "");
}

export async function getAccountOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const orders = await listOrdersForUser(req.user!.id);
  sendSuccess(res, { orders }, "");
}

const addressType = z.enum(["SHIPPING", "BILLING"]);
const addressBody = z.object({
  label: z.string().max(100).optional().nullable(),
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1),
  state: z.string().max(120).optional().nullable(),
  postalCode: z.string().min(1),
  countryCode: z.string().min(2).max(2),
  phone: z.string().max(32).optional().nullable(),
  type: addressType.optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function getAccountAddresses(
  req: Request,
  res: Response,
): Promise<void> {
  const addresses = await listAddressesForUser(req.user!.id);
  sendSuccess(res, { addresses }, "");
}

export async function postAccountAddress(
  req: Request,
  res: Response,
): Promise<void> {
  const body = addressBody.parse(req.body);
  const address = await createAddressForUser(req.user!.id, {
    ...body,
    countryCode: body.countryCode.toUpperCase(),
    type: (body.type as AddressType | null | undefined) ?? null,
  });
  sendSuccess(res, { address }, "Address created", 201);
}

export async function patchAccountAddress(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const body = addressBody.partial().parse(req.body);
  const address = await updateAddressForUser(req.user!.id, id, {
    ...body,
    ...(body.countryCode ? { countryCode: body.countryCode.toUpperCase() } : {}),
    ...(body.type !== undefined
      ? { type: (body.type as AddressType | null | undefined) ?? null }
      : {}),
  });
  sendSuccess(res, { address }, "Address updated");
}

export async function deleteAccountAddress(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  await deleteAddressForUser(req.user!.id, id);
  sendSuccess(res, {}, "Address deleted");
}
