-- Per-size selling price and cost; remove product-level price columns.

-- AlterTable
ALTER TABLE "ProductSize" ADD COLUMN "price" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "ProductSize" ADD COLUMN "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Copy legacy product price onto every existing size row (same value per product until admin adjusts).
UPDATE "ProductSize" AS ps
SET
  "price" = p."price",
  "costPrice" = p."costPrice"
FROM "Product" AS p
WHERE ps."productId" = p."id";

-- Products with no sizes: single "Standard" tier from legacy product price.
INSERT INTO "ProductSize" ("id", "productId", "label", "sortOrder", "price", "costPrice", "createdAt", "updatedAt")
SELECT
  replace(gen_random_uuid()::text, '-', ''),
  p."id",
  'Standard',
  0,
  p."price",
  p."costPrice",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Product" p
WHERE NOT EXISTS (
  SELECT 1 FROM "ProductSize" ps WHERE ps."productId" = p."id"
);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price";
ALTER TABLE "Product" DROP COLUMN "costPrice";

-- Cart lines that used an empty size (legacy no-size products) now map to the inserted "Standard" tier.
UPDATE "CartItem" AS ci
SET "selectedSizeLabel" = 'Standard'
WHERE ci."selectedSizeLabel" = ''
  AND EXISTS (
    SELECT 1 FROM "ProductSize" AS ps
    WHERE ps."productId" = ci."productId" AND ps."label" = 'Standard'
  );
