import { prisma, type Prisma } from "database";
import { AppError } from "../utils/appError.js";
import { serializeDecimal } from "../utils/serialize.js";
import { getOrCreateActiveCart } from "./cart.service.js";

type CheckoutCart = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export async function checkoutSummary(userId: string) {
  const cart = await getOrCreateActiveCart(userId);
  const full: CheckoutCart | null = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!full) {
    throw new AppError("Cart not found", 404);
  }
  if (full.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const issues: { cartItemId: string; message: string }[] = [];
  for (const line of full.items) {
    if (!line.product.isActive) {
      issues.push({
        cartItemId: line.id,
        message: `Product ${line.product.title} is no longer available`,
      });
      continue;
    }
    if (line.product.stockQuantity < line.quantity) {
      issues.push({
        cartItemId: line.id,
        message: `Only ${line.product.stockQuantity} available for ${line.product.title}`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    cart: {
      id: full.id,
      currency: full.currency,
      subtotalAmount: serializeDecimal(full.subtotalAmount),
      discountAmount: serializeDecimal(full.discountAmount),
      totalAmount: serializeDecimal(full.totalAmount),
      items: full.items.map((i: CheckoutCart["items"][number]) => ({
        id: i.id,
        quantity: i.quantity,
        unitPrice: serializeDecimal(i.unitPrice),
        lineTotal: serializeDecimal(i.lineTotal),
        product: {
          id: i.product.id,
          title: i.product.title,
          slug: i.product.slug,
          sku: i.product.sku,
          stockQuantity: i.product.stockQuantity,
          isActive: i.product.isActive,
        },
      })),
    },
    shippingAmount: "0",
    taxAmount: "0",
    grandTotal: serializeDecimal(full.totalAmount),
  };
}
