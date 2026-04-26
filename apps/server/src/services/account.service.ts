import { prisma, type AddressType } from "database";
import { AppError } from "../utils/appError.js";

export type AddressInput = {
  label?: string | null;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  countryCode: string;
  phone?: string | null;
  type?: AddressType | null;
  isDefault?: boolean;
};

async function clearDefaultForType(
  userId: string,
  type: AddressType | null | undefined,
): Promise<void> {
  await prisma.address.updateMany({
    where: { userId, isDefault: true, ...(type ? { type } : {}) },
    data: { isDefault: false },
  });
}

export async function listAddressesForUser(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAddressForUser(userId: string, data: AddressInput) {
  const normalizedType = data.type ?? null;
  if (data.isDefault) {
    await clearDefaultForType(userId, normalizedType);
  }
  return prisma.address.create({
    data: {
      userId,
      label: data.label ?? null,
      fullName: data.fullName,
      line1: data.line1,
      line2: data.line2 ?? null,
      city: data.city,
      state: data.state ?? null,
      postalCode: data.postalCode,
      countryCode: data.countryCode,
      phone: data.phone ?? null,
      type: normalizedType,
      isDefault: data.isDefault ?? false,
    },
  });
}

export async function updateAddressForUser(
  userId: string,
  id: string,
  data: Partial<AddressInput>,
) {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError("Address not found", 404);
  }
  const nextType = data.type === undefined ? existing.type : data.type;
  if (data.isDefault) {
    await clearDefaultForType(userId, nextType ?? null);
  }
  return prisma.address.update({
    where: { id },
    data: {
      ...(data.label !== undefined ? { label: data.label ?? null } : {}),
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.line1 !== undefined ? { line1: data.line1 } : {}),
      ...(data.line2 !== undefined ? { line2: data.line2 ?? null } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.state !== undefined ? { state: data.state ?? null } : {}),
      ...(data.postalCode !== undefined ? { postalCode: data.postalCode } : {}),
      ...(data.countryCode !== undefined ? { countryCode: data.countryCode } : {}),
      ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
    },
  });
}

export async function deleteAddressForUser(userId: string, id: string): Promise<void> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError("Address not found", 404);
  }
  await prisma.address.delete({ where: { id } });
}

