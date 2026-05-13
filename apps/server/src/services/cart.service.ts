import { prisma, Prisma } from "database";
import { AppError } from "../utils/appError.js";
import { serializeDecimal } from "../utils/serialize.js";
import { resolveVariant } from "./product.service.js";

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
        variant: true;
        product: {
          select: {
            id: true;
            title: true;
            slug: true;
            sku: true;
            stockQuantity: true;
            isActive: true;
            images: {
              select: { url: true; altText: true };
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }];
              take: 1;
            };
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
          variant: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              sku: true,
              stockQuantity: true,
              isActive: true,
              images: {
                select: { url: true, altText: true },
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
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
    items: full.items.map((i: CartWithItems["items"][number]) => {
      const thumb = i.product.images[0];
      return {
        id: i.id,
        quantity: i.quantity,
        variantId: i.variantId,
        // Labels are surfaced from the variant relation so renames flow through
        // automatically without rewriting historical cart rows.
        selectedFlavourLabel: i.variant.flavourLabel,
        selectedSizeLabel: i.variant.sizeLabel,
        unitPrice: serializeDecimal(i.unitPrice),
        lineTotal: serializeDecimal(i.lineTotal),
        product: {
          id: i.product.id,
          title: i.product.title,
          slug: i.product.slug,
          sku: i.product.sku,
          stockQuantity: i.product.stockQuantity,
          isActive: i.product.isActive,
          imageUrl: thumb?.url ?? null,
          imageAlt: thumb?.altText ?? null,
        },
      };
    }),
  };
}

export type AddCartItemInput =
  | {
      kind: "byVariantId";
      productId: string;
      variantId: string;
      quantity: number;
    }
  | {
      kind: "byLabels";
      productId: string;
      quantity: number;
      selectedFlavourLabel: string;
      selectedSizeLabel: string;
    };

/**
 * Adds a line to the user's active cart. Callers can pass either a resolved
 * `variantId` (preferred) or the label tuple (legacy clients). Labels are
 * resolved to a variant server-side before any write.
 */
export async function addCartItem(userId: string, input: AddCartItemInput) {
  if (input.quantity < 1) {
    throw new AppError("Invalid quantity", 400);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      isActive: true,
      brand: { isActive: true },
      OR: [{ categoryId: null }, { category: { isActive: true } }],
    },
  });
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const variant =
    input.kind === "byVariantId"
      ? await prisma.productVariant.findFirst({
          where: { id: input.variantId, productId: input.productId },
        })
      : await resolveVariant(
          input.productId,
          input.selectedFlavourLabel.trim(),
          input.selectedSizeLabel.trim(),
        );
  if (!variant || !variant.isActive) {
    throw new AppError("Invalid variant selection", 400);
  }

  const cart = await getOrCreateActiveCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
  });

  const newQty = (existing?.quantity ?? 0) + input.quantity;
  if (newQty > product.stockQuantity) {
    throw new AppError("Insufficient stock", 400);
  }

  // Resolve price tier from ProductSize matching the variant's size label.
  // Falls back to the first tier when the product has no sizes (single-tier).
  const sizeTier =
    variant.sizeLabel.length > 0
      ? await prisma.productSize.findFirst({
          where: { productId: input.productId, label: variant.sizeLabel },
        })
      : null;
  const fallbackTier = await prisma.productSize.findFirst({
    where: { productId: input.productId },
    orderBy: { sortOrder: "asc" },
  });
  const unitPrice = sizeTier?.price ?? fallbackTier?.price;
  if (!unitPrice) {
    throw new AppError("Product has no price tier", 500);
  }
  const lineTotal = unitPrice.mul(newQty);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    create: {
      cartId: cart.id,
      productId: input.productId,
      variantId: variant.id,
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
    include: {
      cart: true,
      variant: true,
      product: { include: { brand: true, category: true } },
    },
  });
  if (!item || item.cart.userId !== userId || item.cart.status !== "ACTIVE") {
    throw new AppError("Cart item not found", 404);
  }
  const catOk =
    item.product.categoryId == null ||
    (item.product.category != null && item.product.category.isActive);
  if (!item.product.isActive || !item.product.brand.isActive || !catOk) {
    throw new AppError("Product unavailable", 400);
  }
  if (item.product.stockQuantity < quantity) {
    throw new AppError("Insufficient stock", 400);
  }
  const sizeTier =
    item.variant.sizeLabel.length > 0
      ? await prisma.productSize.findFirst({
          where: { productId: item.productId, label: item.variant.sizeLabel },
        })
      : null;
  const fallbackTier = await prisma.productSize.findFirst({
    where: { productId: item.productId },
    orderBy: { sortOrder: "asc" },
  });
  const unitPrice = sizeTier?.price ?? fallbackTier?.price;
  if (!unitPrice) {
    throw new AppError("Product has no price tier", 500);
  }
  const lineTotal = unitPrice.mul(quantity);
  await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity,
      unitPrice,
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
