-- Backfill before NOT NULL
UPDATE "Product" SET "shortDesc" = '' WHERE "shortDesc" IS NULL;
UPDATE "Product" SET "description" = '' WHERE "description" IS NULL;
UPDATE "Product" SET "flavour" = '' WHERE "flavour" IS NULL;
UPDATE "Product" SET "costPrice" = 0 WHERE "costPrice" IS NULL;

-- Every product must reference a brand (pick oldest brand when missing)
UPDATE "Product" p
SET "brandId" = (SELECT b."id" FROM "Brand" b ORDER BY b."createdAt" ASC LIMIT 1)
WHERE p."brandId" IS NULL;

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_brandId_fkey";

ALTER TABLE "Product" ALTER COLUMN "shortDesc" SET DEFAULT '';
ALTER TABLE "Product" ALTER COLUMN "shortDesc" SET NOT NULL;

ALTER TABLE "Product" ALTER COLUMN "description" SET DEFAULT '';
ALTER TABLE "Product" ALTER COLUMN "description" SET NOT NULL;

ALTER TABLE "Product" ALTER COLUMN "flavour" SET DEFAULT '';
ALTER TABLE "Product" ALTER COLUMN "flavour" SET NOT NULL;

ALTER TABLE "Product" ALTER COLUMN "costPrice" SET DEFAULT 0;
ALTER TABLE "Product" ALTER COLUMN "costPrice" SET NOT NULL;

ALTER TABLE "Product" ALTER COLUMN "brandId" SET NOT NULL;

ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
