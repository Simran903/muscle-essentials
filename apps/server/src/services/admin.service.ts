import { prisma, Prisma, type ReviewStatus } from "database";
import { interactiveTransactionOptions } from "../config/transaction.js";
import { AppError } from "../utils/appError.js";
import { serializeDecimal } from "../utils/serialize.js";

const defaultTake = 20;
const maxTake = 100;

type AdminProductRow = Prisma.ProductGetPayload<{
  include: { brand: true; category: true };
}>;

type AdminOrderListRow = Prisma.OrderGetPayload<{
  include: { user: { select: { id: true; email: true } } };
}>;

type AdminBrandRow = Prisma.BrandGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export async function adminListBrands(page?: number, limit?: number) {
  const pageN = Math.max(1, page ?? 1);
  const take = Math.min(maxTake, Math.max(1, limit ?? defaultTake));
  const skip = (pageN - 1) * take;
  const [items, total] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      skip,
      take,
      include: { _count: { select: { products: true } } },
    }),
    prisma.brand.count(),
  ]);
  return {
    items: items.map((b: AdminBrandRow) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      isActive: b.isActive,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      productCount: b._count.products,
    })),
    pagination: {
      page: pageN,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}

export async function adminListProducts(page?: number, limit?: number) {
  const pageN = Math.max(1, page ?? 1);
  const take = Math.min(maxTake, Math.max(1, limit ?? defaultTake));
  const skip = (pageN - 1) * take;
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { brand: true, category: true },
    }),
    prisma.product.count(),
  ]);
  return {
    items: items.map((p: AdminProductRow) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      flavour: p.flavour,
      price: serializeDecimal(p.price),
      stockQuantity: p.stockQuantity,
      isActive: p.isActive,
      categoryId: p.categoryId,
      brand: p.brand
        ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug }
        : null,
      category: p.category
        ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
        : null,
    })),
    pagination: { page: pageN, limit: take, total, totalPages: Math.ceil(total / take) },
  };
}

export async function adminCreateProduct(data: {
  title: string;
  slug: string;
  sku: string;
  price: string;
  brandId: string;
  categoryId?: string | null;
  shortDesc: string;
  description: string;
  flavour: string;
  costPrice: string;
  stockQuantity: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
}) {
  const brandId = data.brandId.trim();
  if (!brandId) {
    throw new AppError("brandId is required", 400);
  }
  const categoryId =
    data.categoryId && data.categoryId.trim().length > 0
      ? data.categoryId.trim()
      : null;
  if (categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      throw new AppError("Category not found", 404);
    }
  }
  return prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      sku: data.sku,
      price: new Prisma.Decimal(data.price),
      brandId,
      categoryId,
      shortDesc: data.shortDesc,
      description: data.description,
      flavour: data.flavour,
      costPrice: new Prisma.Decimal(data.costPrice),
      stockQuantity: data.stockQuantity,
      currency: data.currency,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    },
  });
}

export async function adminUpdateProduct(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    sku: string;
    price: string;
    brandId: string;
    categoryId: string | null;
    shortDesc: string;
    description: string;
    flavour: string;
    costPrice: string;
    currency: string;
    stockQuantity: number;
    isActive: boolean;
    isFeatured: boolean;
  }>,
) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Product not found", 404);
  }
  const update: Prisma.ProductUpdateInput = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.sku !== undefined) update.sku = data.sku;
  if (data.price !== undefined) update.price = new Prisma.Decimal(data.price);
  if (data.brandId !== undefined) {
    const bid = data.brandId.trim();
    if (!bid) {
      throw new AppError("brandId cannot be empty", 400);
    }
    update.brand = { connect: { id: bid } };
  }
  if (data.categoryId !== undefined) {
    const cid =
      data.categoryId && data.categoryId.trim().length > 0
        ? data.categoryId.trim()
        : null;
    if (cid) {
      const cat = await prisma.category.findUnique({ where: { id: cid } });
      if (!cat) {
        throw new AppError("Category not found", 404);
      }
      update.category = { connect: { id: cid } };
    } else {
      update.category = { disconnect: true };
    }
  }
  if (data.shortDesc !== undefined) update.shortDesc = data.shortDesc;
  if (data.description !== undefined) update.description = data.description;
  if (data.flavour !== undefined) update.flavour = data.flavour;
  if (data.costPrice !== undefined) {
    update.costPrice = new Prisma.Decimal(data.costPrice);
  }
  if (data.currency !== undefined) update.currency = data.currency;
  if (data.stockQuantity !== undefined) update.stockQuantity = data.stockQuantity;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  if (data.isFeatured !== undefined) update.isFeatured = data.isFeatured;
  return prisma.product.update({ where: { id }, data: update });
}

export async function adminDeleteProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function adminCreateBrand(data: {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
}) {
  return prisma.brand.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function adminUpdateBrand(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
  }>,
) {
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Brand not found", 404);
  }
  const update: Prisma.BrandUpdateInput = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.description !== undefined) update.description = data.description;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  return prisma.brand.update({ where: { id }, data: update });
}

/** Soft-delete: hides brand from active catalog; products keep brandId until changed. */
export async function adminDeleteBrand(id: string): Promise<void> {
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Brand not found", 404);
  }
  await prisma.brand.update({
    where: { id },
    data: { isActive: false },
  });
}

type AdminCategoryRow = Prisma.CategoryGetPayload<{
  include: {
    _count: { select: { primaryProducts: true } };
  };
}>;

export async function adminListCategories(page?: number, limit?: number) {
  const pageN = Math.max(1, page ?? 1);
  const take = Math.min(maxTake, Math.max(1, limit ?? defaultTake));
  const skip = (pageN - 1) * take;
  const [items, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      skip,
      take,
      include: {
        _count: { select: { primaryProducts: true } },
      },
    }),
    prisma.category.count(),
  ]);
  return {
    items: items.map((c: AdminCategoryRow) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      productCount: c._count.primaryProducts,
    })),
    pagination: {
      page: pageN,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}

export async function adminCreateCategory(data: {
  name: string;
  slug: string;
  isActive?: boolean;
}) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      isActive: data.isActive ?? true,
    },
  });
}

export async function adminUpdateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    isActive: boolean;
  }>,
) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Category not found", 404);
  }

  const update: Prisma.CategoryUpdateInput = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  return prisma.category.update({ where: { id }, data: update });
}

/** Soft-delete: hides category from active catalog; product links remain until edited. */
export async function adminDeleteCategory(id: string): Promise<void> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Category not found", 404);
  }
  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function adminListOrders(page?: number, limit?: number) {
  const pageN = Math.max(1, page ?? 1);
  const take = Math.min(maxTake, Math.max(1, limit ?? defaultTake));
  const skip = (pageN - 1) * take;
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      skip,
      take,
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.order.count(),
  ]);
  return {
    items: items.map((o: AdminOrderListRow) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: serializeDecimal(o.totalAmount),
      placedAt: o.placedAt,
      user: o.user,
    })),
    pagination: { page: pageN, limit: take, total, totalPages: Math.ceil(total / take) },
  };
}

export async function adminGetOrder(id: string) {
  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!o) {
    throw new AppError("Order not found", 404);
  }
  return o;
}

export async function adminUpdateOrder(
  id: string,
  data: { status?: string; paymentStatus?: string },
) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Order not found", 404);
  }
  return prisma.order.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status as never } : {}),
      ...(data.paymentStatus
        ? { paymentStatus: data.paymentStatus as never }
        : {}),
    },
  });
}

export async function adminListUsers(page?: number, limit?: number) {
  const pageN = Math.max(1, page ?? 1);
  const take = Math.min(maxTake, Math.max(1, limit ?? defaultTake));
  const skip = (pageN - 1) * take;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);
  return {
    items,
    pagination: { page: pageN, limit: take, total, totalPages: Math.ceil(total / take) },
  };
}

export async function adminUpdateUser(
  id: string,
  data: { role?: string; status?: string },
) {
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u || u.deletedAt) {
    throw new AppError("User not found", 404);
  }
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.role ? { role: data.role as never } : {}),
      ...(data.status ? { status: data.status as never } : {}),
    },
  });
}

export async function adminListReviews(
  page?: number,
  limit?: number,
  status?: ReviewStatus,
) {
  const pageN = Math.max(1, page ?? 1);
  const take = Math.min(maxTake, Math.max(1, limit ?? defaultTake));
  const skip = (pageN - 1) * take;
  const where: Prisma.ReviewWhereInput = {};
  if (status) where.status = status;
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        product: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);
  return {
    items,
    pagination: { page: pageN, limit: take, total, totalPages: Math.ceil(total / take) },
  };
}

export async function adminModerateReview(
  reviewId: string,
  moderatorId: string,
  toStatus: ReviewStatus,
  note?: string,
) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  const fromStatus = review.status;

  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
    await tx.review.update({
      where: { id: reviewId },
      data: {
        status: toStatus,
        approvedAt: toStatus === "APPROVED" ? new Date() : null,
        rejectedAt: toStatus === "REJECTED" ? new Date() : null,
        adminNote: note ?? review.adminNote,
      },
    });
    await tx.reviewModeration.create({
      data: {
        reviewId,
        moderatorId,
        fromStatus,
        toStatus,
        note: note ?? null,
      },
    });
    return tx.review.findUnique({ where: { id: reviewId } });
  },
    interactiveTransactionOptions,
  );
}
