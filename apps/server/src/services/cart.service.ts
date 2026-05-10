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
        selectedFlavourLabel: i.selectedFlavourLabel,
        selectedSizeLabel: i.selectedSizeLabel,
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

export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number,
  options: {
    selectedFlavourLabel: string;
    selectedSizeLabel: string;
  },
) {
  if (quantity < 1) {
    throw new AppError("Invalid quantity", 400);
  }
  const flavour = options.selectedFlavourLabel.trim();
  const size = options.selectedSizeLabel.trim();

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const [flavourCount, sizeCount] = await Promise.all([
    prisma.productFlavour.count({ where: { productId } }),
    prisma.productSize.count({ where: { productId } }),
  ]);

  if (flavourCount > 0 && flavour.length === 0) {
    throw new AppError("Flavour is required for this product", 400);
  }
  if (sizeCount > 0 && size.length === 0) {
    throw new AppError("Size is required for this product", 400);
  }
  if (flavourCount === 0 && flavour.length > 0) {
    throw new AppError("This product has no flavours", 400);
  }
  if (sizeCount === 0 && size.length > 0) {
    throw new AppError("This product has no sizes", 400);
  }

  if (flavour.length > 0) {
    const row = await prisma.productFlavour.findFirst({
      where: { productId, label: flavour },
    });
    if (!row) {
      throw new AppError("Invalid flavour selection", 400);
    }
  }
  let sizeTier = null as { price: Prisma.Decimal } | null;
  if (size.length > 0) {
    const row = await prisma.productSize.findFirst({
      where: { productId, label: size },
    });
    if (!row) {
      throw new AppError("Invalid size selection", 400);
    }
    sizeTier = row;
  }

  const cart = await getOrCreateActiveCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_selectedFlavourLabel_selectedSizeLabel: {
        cartId: cart.id,
        productId,
        selectedFlavourLabel: flavour,
        selectedSizeLabel: size,
      },
    },
  });

  const newQty = (existing?.quantity ?? 0) + quantity;
  if (newQty > product.stockQuantity) {
    throw new AppError("Insufficient stock", 400);
  }

  const fallbackTier = await prisma.productSize.findFirst({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
  const unitPrice = sizeTier?.price ?? fallbackTier?.price;
  if (!unitPrice) {
    throw new AppError("Product has no price tier", 500);
  }
  const lineTotal = unitPrice.mul(newQty);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId_selectedFlavourLabel_selectedSizeLabel: {
        cartId: cart.id,
        productId,
        selectedFlavourLabel: flavour,
        selectedSizeLabel: size,
      },
    },
    create: {
      cartId: cart.id,
      productId,
      selectedFlavourLabel: flavour,
      selectedSizeLabel: size,
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
  const sizeTier = await prisma.productSize.findFirst({
    where: { productId: item.productId, label: item.selectedSizeLabel.trim() },
  });
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
