import { prisma, Prisma } from "database";
import { AppError } from "../utils/appError.js";
import { serializeDecimal } from "../utils/serialize.js";

const defaultTake = 20;
const maxTake = 100;

const productInclude = {
  brand: true,
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  sizes: { orderBy: { sortOrder: "asc" as const } },
  flavours: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

type ProductFull = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function mapProduct(p: ProductFull) {
  const flavours = p.flavours.map((f: ProductFull["flavours"][number]) => ({
    id: f.id,
    label: f.label,
    sortOrder: f.sortOrder,
  }));
  return {
    id: p.id,
    title: p.title,
    createdAt: p.createdAt.toISOString(),
    slug: p.slug,
    shortDesc: p.shortDesc,
    description: p.description,
    flavour: flavours.map((f: (typeof flavours)[number]) => f.label).join(", "),
    flavours,
    sku: p.sku,
    price: serializeDecimal(p.price),
    currency: p.currency,
    stockQuantity: p.stockQuantity,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    isDealoftheDay: p.isDealoftheDay,
    brand: p.brand
      ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug }
      : null,
    categoryId: p.categoryId,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : null,
    images: p.images.map((i: ProductFull["images"][number]) => ({
      id: i.id,
      url: i.url,
      altText: i.altText,
      sortOrder: i.sortOrder,
      isPrimary: i.isPrimary,
    })),
    sizes: p.sizes.map((size: ProductFull["sizes"][number]) => ({
      id: size.id,
      label: size.label,
      sortOrder: size.sortOrder,
    })),
  };
}

export async function listProducts(params: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  brandSlug?: string;
  featured?: boolean;
}) {
  const page = Math.max(1, params.page ?? 1);
  const take = Math.min(maxTake, Math.max(1, params.limit ?? defaultTake));
  const skip = (page - 1) * take;

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (params.featured === true) {
    where.isFeatured = true;
  }
  if (params.brandSlug) {
    where.brand = { slug: params.brandSlug, isActive: true };
  }
  if (params.categorySlug) {
    where.category = { slug: params.categorySlug, isActive: true };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(mapProduct),
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  };
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: productInclude,
  });
  if (!p) {
    throw new AppError("Product not found", 404);
  }
  return mapProduct(p);
}

export async function listByCategorySlug(categorySlug: string, page?: number, limit?: number) {
  const cat = await prisma.category.findFirst({
    where: { slug: categorySlug, isActive: true },
  });
  if (!cat) {
    throw new AppError("Category not found", 404);
  }
  return listProducts({ page, limit, categorySlug });
}

export async function listByBrandSlug(brandSlug: string, page?: number, limit?: number) {
  const brand = await prisma.brand.findFirst({
    where: { slug: brandSlug, isActive: true },
  });
  if (!brand) {
    throw new AppError("Brand not found", 404);
  }
  return listProducts({ page, limit, brandSlug });
}

export async function searchProducts(q: string, page?: number, limit?: number) {
  const term = q.trim();
  if (!term) {
    throw new AppError("Query required", 400);
  }
  const pageN = Math.max(1, page ?? 1);
  const take = Math.min(maxTake, Math.max(1, limit ?? defaultTake));
  const skip = (pageN - 1) * take;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { title: "asc" },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(mapProduct),
    pagination: {
      page: pageN,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}

export async function getProductIdBySlug(slug: string): Promise<string> {
  const p = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: { id: true },
  });
  if (!p) {
    throw new AppError("Product not found", 404);
  }
  return p.id;
}

const activeCatalogProduct = { isActive: true } as const;

export type ShopFilters = {
  brands: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
  flavours: { label: string }[];
};

/** Distinct brands, categories, and flavour labels that appear on at least one active product. */
export async function listShopFilters(): Promise<ShopFilters> {
  const [brands, categories, flavourGroups] = await Promise.all([
    prisma.brand.findMany({
      where: {
        isActive: true,
        products: { some: activeCatalogProduct },
      },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        primaryProducts: { some: activeCatalogProduct },
      },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.productFlavour.groupBy({
      by: ["label"],
      where: { product: activeCatalogProduct },
      orderBy: { label: "asc" },
    }),
  ]);

  return {
    brands,
    categories,
    flavours: flavourGroups.map((g: { label: string }) => ({ label: g.label })),
  };
}
