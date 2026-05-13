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
  variants: {
    where: { isActive: true },
    orderBy: [
      { flavourLabel: "asc" as const },
      { sizeLabel: "asc" as const },
    ],
  },
  variantSpotlights: {
    include: { variant: true },
  },
} satisfies Prisma.ProductInclude;

/** Active product, active brand, and uncategorized or active primary category. */
const activeCatalogProduct: Prisma.ProductWhereInput = {
  isActive: true,
  brand: { isActive: true },
  OR: [{ categoryId: null }, { category: { isActive: true } }],
};

type ProductFull = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function sizeSellRange(sizes: ProductFull["sizes"]) {
  if (sizes.length === 0) {
    return { min: new Prisma.Decimal(0), max: new Prisma.Decimal(0) };
  }
  let min = sizes[0]!.price;
  let max = sizes[0]!.price;
  for (const s of sizes) {
    if (s.price.lt(min)) min = s.price;
    if (s.price.gt(max)) max = s.price;
  }
  return { min, max };
}

function mapProduct(p: ProductFull) {
  const flavours = p.flavours.map((f: ProductFull["flavours"][number]) => ({
    id: f.id,
    label: f.label,
    sortOrder: f.sortOrder,
  }));
  const { min: fromPrice, max: toPrice } = sizeSellRange(p.sizes);
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
    /** Lowest size tier price (for listings, sort, cards). */
    price: serializeDecimal(fromPrice),
    /** When tiers differ, highest price (optional “from / range” UX). */
    maxPrice: toPrice.eq(fromPrice) ? undefined : serializeDecimal(toPrice),
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
      price: serializeDecimal(size.price),
    })),
    variants: (p.variants ?? []).map(
      (v: ProductFull["variants"][number]) => ({
        id: v.id,
        flavourLabel: v.flavourLabel,
        sizeLabel: v.sizeLabel,
        isActive: v.isActive,
      }),
    ),
    variantSpotlights: (p.variantSpotlights ?? []).map(
      (v: ProductFull["variantSpotlights"][number]) => ({
        variantId: v.variantId,
        flavourLabel: v.variant.flavourLabel,
        sizeLabel: v.variant.sizeLabel,
        isFeatured: v.isFeatured,
        isBestseller: v.isBestseller,
        isDealoftheDay: v.isDealoftheDay,
      }),
    ),
  };
}

export async function listProducts(params: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  brandSlug?: string;
  featured?: boolean;
  bestseller?: boolean;
  dealOfTheDay?: boolean;
}) {
  const page = Math.max(1, params.page ?? 1);
  const take = Math.min(maxTake, Math.max(1, params.limit ?? defaultTake));
  const skip = (page - 1) * take;

  /**
   * Consumer catalog: active product, active brand, and if the product has a primary category
   * then that category must be active (uncategorized products still show).
   */
  const clauses: Prisma.ProductWhereInput[] = [activeCatalogProduct];
  if (params.featured === true) {
    clauses.push({
      OR: [
        { isFeatured: true },
        { variantSpotlights: { some: { isFeatured: true } } },
      ],
    });
  }
  if (params.bestseller === true) {
    clauses.push({
      OR: [
        { isBestseller: true },
        { variantSpotlights: { some: { isBestseller: true } } },
      ],
    });
  }
  if (params.dealOfTheDay === true) {
    clauses.push({
      OR: [
        { isDealoftheDay: true },
        { variantSpotlights: { some: { isDealoftheDay: true } } },
      ],
    });
  }
  if (params.brandSlug) {
    clauses.push({ brand: { slug: params.brandSlug, isActive: true } });
  }
  if (params.categorySlug) {
    clauses.push({ category: { slug: params.categorySlug, isActive: true } });
  }
  const where: Prisma.ProductWhereInput =
    clauses.length === 1 ? clauses[0]! : { AND: clauses };

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
    where: { slug, ...activeCatalogProduct },
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
    AND: [
      activeCatalogProduct,
      {
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
          { sku: { contains: term, mode: "insensitive" } },
        ],
      },
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
    where: { slug, ...activeCatalogProduct },
    select: { id: true },
  });
  if (!p) {
    throw new AppError("Product not found", 404);
  }
  return p.id;
}

/**
 * Resolves a product's `(flavour, size)` tuple to an existing active variant.
 * Throws when the tuple doesn't match a known variant or doesn't fit the
 * product's flavour/size requirements.
 */
export async function resolveVariant(
  productId: string,
  flavourLabel: string,
  sizeLabel: string,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      flavours: { select: { id: true }, take: 1 },
      sizes: { select: { id: true }, take: 1 },
    },
  });
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  const hasFlavours = product.flavours.length > 0;
  const hasSizes = product.sizes.length > 0;
  if (hasFlavours && !flavourLabel) {
    throw new AppError("Flavour is required for this product", 400);
  }
  if (!hasFlavours && flavourLabel) {
    throw new AppError("This product has no flavours", 400);
  }
  if (hasSizes && !sizeLabel) {
    throw new AppError("Size is required for this product", 400);
  }
  if (!hasSizes && sizeLabel) {
    throw new AppError("This product has no sizes", 400);
  }

  const variant = await prisma.productVariant.findUnique({
    where: {
      productId_flavourLabel_sizeLabel: { productId, flavourLabel, sizeLabel },
    },
  });
  if (!variant || !variant.isActive) {
    throw new AppError("Invalid variant selection", 400);
  }
  return variant;
}

/**
 * Ensures `ProductVariant` rows mirror the current (flavour × size) catalog
 * for a product. Missing tuples are upserted to active; variants not in the
 * desired set are marked inactive (we never hard-delete since order rows
 * reference them historically).
 */
type DbClient = Prisma.TransactionClient | typeof prisma;
type ExistingVariantRow = {
  id: string;
  flavourLabel: string;
  sizeLabel: string;
  isActive: boolean;
};

export async function reconcileProductVariants(
  client: DbClient,
  productId: string,
): Promise<void> {
  const [flavours, sizes, existing] = (await Promise.all([
    client.productFlavour.findMany({
      where: { productId },
      select: { label: true },
    }),
    client.productSize.findMany({
      where: { productId },
      select: { label: true },
    }),
    client.productVariant.findMany({
      where: { productId },
      select: { id: true, flavourLabel: true, sizeLabel: true, isActive: true },
    }),
  ])) as [{ label: string }[], { label: string }[], ExistingVariantRow[]];

  const flavourLabels =
    flavours.length > 0 ? flavours.map((f: { label: string }) => f.label) : [""];
  const sizeLabels =
    sizes.length > 0 ? sizes.map((s: { label: string }) => s.label) : [""];

  const desired = new Set<string>();
  const desiredRows: { flavourLabel: string; sizeLabel: string }[] = [];
  for (const fl of flavourLabels) {
    for (const sz of sizeLabels) {
      desired.add(`${fl}\u0000${sz}`);
      desiredRows.push({ flavourLabel: fl, sizeLabel: sz });
    }
  }

  const existingKeys = new Set(
    existing.map((v: ExistingVariantRow) => `${v.flavourLabel}\u0000${v.sizeLabel}`),
  );

  const toCreate = desiredRows.filter(
    (r) => !existingKeys.has(`${r.flavourLabel}\u0000${r.sizeLabel}`),
  );
  if (toCreate.length > 0) {
    await client.productVariant.createMany({
      data: toCreate.map((r) => ({
        productId,
        flavourLabel: r.flavourLabel,
        sizeLabel: r.sizeLabel,
      })),
      skipDuplicates: true,
    });
  }

  const toDeactivate = existing.filter(
    (v: ExistingVariantRow) =>
      v.isActive && !desired.has(`${v.flavourLabel}\u0000${v.sizeLabel}`),
  );
  const toActivate = existing.filter(
    (v: ExistingVariantRow) =>
      !v.isActive && desired.has(`${v.flavourLabel}\u0000${v.sizeLabel}`),
  );
  if (toDeactivate.length > 0) {
    await client.productVariant.updateMany({
      where: { id: { in: toDeactivate.map((v: ExistingVariantRow) => v.id) } },
      data: { isActive: false },
    });
  }
  if (toActivate.length > 0) {
    await client.productVariant.updateMany({
      where: { id: { in: toActivate.map((v: ExistingVariantRow) => v.id) } },
      data: { isActive: true },
    });
  }
}

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
