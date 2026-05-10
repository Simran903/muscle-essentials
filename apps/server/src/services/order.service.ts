import crypto from "node:crypto";
import { prisma, Prisma } from "database";
import { AppError } from "../utils/appError.js";
import { serializeDecimal } from "../utils/serialize.js";
import { interactiveTransactionOptions } from "../config/transaction.js";
import { getOrCreateActiveCart } from "./cart.service.js";

function generateOrderNumber(): string {
  return `ME-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function createOrderFromCart(
  userId: string,
  shippingAddressId: string,
  billingAddressId?: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user?.phone || !user.phone.trim()) {
    throw new AppError(
      "Phone number is required before placing an order",
      400,
    );
  }

  const [shipping, billing] = await Promise.all([
    prisma.address.findFirst({
      where: { id: shippingAddressId, userId },
    }),
    billingAddressId
      ? prisma.address.findFirst({
          where: { id: billingAddressId, userId },
        })
      : Promise.resolve(null),
  ]);

  if (!shipping) {
    throw new AppError("Shipping address not found", 404);
  }
  let finalBillingId = shipping.id;
  if (billingAddressId) {
    if (!billing) {
      throw new AppError("Billing address not found", 404);
    }
    finalBillingId = billing.id;
  }

  const cart = await getOrCreateActiveCart(userId);
  const full = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: { include: { product: { include: { brand: true, category: true } } } },
    },
  });
  if (!full || full.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  for (const line of full.items) {
    const categoryOk =
      line.product.categoryId == null ||
      (line.product.category != null && line.product.category.isActive);
    if (!line.product.isActive || !line.product.brand.isActive || !categoryOk) {
      throw new AppError(
        `Product ${line.product.title} is no longer available`,
        400,
      );
    }
    if (line.product.stockQuantity < line.quantity) {
      throw new AppError(`Insufficient stock for ${line.product.title}`, 400);
    }
  }

  const orderNumber = generateOrderNumber();
  const shippingAmt = new Prisma.Decimal(0);
  const taxAmt = new Prisma.Decimal(0);

  const order = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        cartId: full.id,
        shippingAddressId: shipping.id,
        billingAddressId: finalBillingId,
        status: "PENDING",
        paymentStatus: "PENDING",
        currency: full.currency,
        subtotalAmount: full.subtotalAmount,
        shippingAmount: shippingAmt,
        discountAmount: full.discountAmount,
        taxAmount: taxAmt,
        totalAmount: full.totalAmount,
      },
    });

    for (const line of full.items) {
      await tx.orderItem.create({
        data: {
          orderId: created.id,
          productId: line.productId,
          productTitle: line.product.title,
          productSku: line.product.sku,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
        },
      });
      await tx.product.update({
        where: { id: line.productId },
        data: { stockQuantity: { decrement: line.quantity } },
      });
    }

    await tx.cart.update({
      where: { id: full.id },
      data: { status: "CONVERTED", convertedAt: new Date() },
    });

    return created;
  },
    interactiveTransactionOptions,
  );

  return getOrderByIdForUser(userId, order.id);
}

function mapOrder(o: {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotalAmount: unknown;
  shippingAmount: unknown;
  discountAmount: unknown;
  taxAmount: unknown;
  totalAmount: unknown;
  placedAt: Date;
  items: {
    id: string;
    quantity: number;
    unitPrice: unknown;
    lineTotal: unknown;
    productTitle: string;
    productSku: string;
  }[];
}) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    currency: o.currency,
    subtotalAmount: serializeDecimal(o.subtotalAmount),
    shippingAmount: serializeDecimal(o.shippingAmount),
    discountAmount: serializeDecimal(o.discountAmount),
    taxAmount: serializeDecimal(o.taxAmount),
    totalAmount: serializeDecimal(o.totalAmount),
    placedAt: o.placedAt,
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      unitPrice: serializeDecimal(i.unitPrice),
      lineTotal: serializeDecimal(i.lineTotal),
      productTitle: i.productTitle,
      productSku: i.productSku,
    })),
  };
}

export async function listOrdersForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { placedAt: "desc" },
    include: {
      items: true,
    },
  });
  return orders.map(mapOrder);
}

export async function getOrderByIdForUser(userId: string, orderId: string) {
  const o = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!o) {
    throw new AppError("Order not found", 404);
  }
  return mapOrder(o);
}
