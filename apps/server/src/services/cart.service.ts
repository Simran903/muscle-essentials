import { prisma, Prisma } from "database";
import { AppError } from "../utils/appError.js";
import { serializeDecimal } from "../utils/serialize.js";

async function recalcCartTotals(cartId: string): Promise<void> {
  const items = await prisma.cartItem.findMany({ where: { cartId } });
  let subtotal = new Prisma.Decimal(0);
  for (const item of items) {
    subtotal = subtotal.add(item.lineTotal);
  }
  const discount = new Prisma.Decimal(0);
  const total = subtotal.sub(discount);
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotalAmount: subtotal,
      discountAmount: discount,
      totalAmount: total,
    },
  });
}

export async function getOrCreateActiveCart(userId: string) {
  const existing = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;
  return prisma.cart.create({
    data: {
      userId,
      status: "ACTIVE",
      currency: "INR",
    },
  });
}

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            title: true;
            slug: true;
            sku: true;
            stockQuantity: true;
            isActive: true;
          };
        };
      };
    };
  };
}>;

export async function getCartForUser(userId: string) {
  const cart = await getOrCreateActiveCart(userId);
  const full: CartWithItems = await prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              sku: true,
              stockQuantity: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    id: full.id,
    status: full.status,
    currency: full.currency,
    subtotalAmount: serializeDecimal(full.subtotalAmount),
    discountAmount: serializeDecimal(full.discountAmount),
    totalAmount: serializeDecimal(full.totalAmount),
    items: full.items.map((i: CartWithItems["items"][number]) => ({
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
  };
}

export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  if (quantity < 1) {
    throw new AppError("Invalid quantity", 400);
  }
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const cart = await getOrCreateActiveCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
  });

  const newQty = (existing?.quantity ?? 0) + quantity;
  if (newQty > product.stockQuantity) {
    throw new AppError("Insufficient stock", 400);
  }

  const unitPrice = product.price;
  const lineTotal = unitPrice.mul(newQty);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: {
      cartId: cart.id,
      productId,
      quantity: newQty,
      unitPrice,
      lineTotal,
    },
    update: {
      quantity: newQty,
      unitPrice,
      lineTotal,
    },
  });

  await recalcCartTotals(cart.id);
  return getCartForUser(userId);
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
) {
  if (quantity < 1) {
    throw new AppError("Invalid quantity", 400);
  }
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });
  if (!item || item.cart.userId !== userId || item.cart.status !== "ACTIVE") {
    throw new AppError("Cart item not found", 404);
  }
  if (!item.product.isActive) {
    throw new AppError("Product unavailable", 400);
  }
  if (item.product.stockQuantity < quantity) {
    throw new AppError("Insufficient stock", 400);
  }
  const lineTotal = item.product.price.mul(quantity);
  await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity,
      unitPrice: item.product.price,
      lineTotal,
    },
  });
  await recalcCartTotals(item.cartId);
  return getCartForUser(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== userId || item.cart.status !== "ACTIVE") {
    throw new AppError("Cart item not found", 404);
  }
  const cartId = item.cartId;
  await prisma.cartItem.delete({ where: { id: itemId } });
  await recalcCartTotals(cartId);
  return getCartForUser(userId);
}

export async function getActiveCartRow(userId: string) {
  return getOrCreateActiveCart(userId);
}
