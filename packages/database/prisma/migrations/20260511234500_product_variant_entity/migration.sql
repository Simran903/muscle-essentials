-- Introduce a canonical ProductVariant entity. All variant references move from
-- (flavourLabel, sizeLabel) tuples to a variantId FK; OrderItem keeps its
-- snapshot labels so historical orders survive catalog renames.

-- 1) ProductVariant table.
CREATE TABLE "ProductVariant" (
    "id"           TEXT        NOT NULL,
    "productId"    TEXT        NOT NULL,
    "flavourLabel" TEXT        NOT NULL DEFAULT '',
    "sizeLabel"    TEXT        NOT NULL DEFAULT '',
    "isActive"     BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductVariant_productId_flavourLabel_sizeLabel_key"
  ON "ProductVariant"("productId", "flavourLabel", "sizeLabel");

CREATE INDEX "ProductVariant_productId_isActive_idx"
  ON "ProductVariant"("productId", "isActive");

ALTER TABLE "ProductVariant"
  ADD CONSTRAINT "ProductVariant_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 2) Backfill variants. We seed from every distinct tuple in use plus the full
--    flavour × size cross product so new selections always resolve. The id is
--    a deterministic hash so this migration is safe to re-run in development.
INSERT INTO "ProductVariant" ("id", "productId", "flavourLabel", "sizeLabel", "isActive", "updatedAt")
SELECT
  'pv_' || md5("productId" || '|' || "flavourLabel" || '|' || "sizeLabel"),
  "productId",
  "flavourLabel",
  "sizeLabel",
  true,
  CURRENT_TIMESTAMP
FROM (
  -- Products with no variants of either kind get a single ("","") row.
  SELECT p."id" AS "productId", '' AS "flavourLabel", '' AS "sizeLabel"
  FROM "Product" p
  WHERE NOT EXISTS (SELECT 1 FROM "ProductFlavour" pf WHERE pf."productId" = p."id")
    AND NOT EXISTS (SELECT 1 FROM "ProductSize" ps WHERE ps."productId" = p."id")

  UNION

  -- Flavour × size cross product (when both exist).
  SELECT pf."productId", pf."label", ps."label"
  FROM "ProductFlavour" pf
  JOIN "ProductSize"    ps ON ps."productId" = pf."productId"

  UNION

  -- Sizes only.
  SELECT ps."productId", '', ps."label"
  FROM "ProductSize" ps
  WHERE NOT EXISTS (SELECT 1 FROM "ProductFlavour" pf WHERE pf."productId" = ps."productId")

  UNION

  -- Flavours only.
  SELECT pf."productId", pf."label", ''
  FROM "ProductFlavour" pf
  WHERE NOT EXISTS (SELECT 1 FROM "ProductSize" ps WHERE ps."productId" = pf."productId")

  UNION

  -- Capture any tuples already referenced by existing rows so legacy data
  -- with typos / removed catalog labels still gets a home.
  SELECT "productId", "selectedFlavourLabel", "selectedSizeLabel" FROM "CartItem"
  UNION
  SELECT "productId", "selectedFlavourLabel", "selectedSizeLabel" FROM "OrderItem"
  UNION
  SELECT "productId", "flavourLabel", "sizeLabel" FROM "Review"
  UNION
  SELECT "productId", "flavourLabel", "sizeLabel" FROM "ProductVariantSpotlight"
) AS tuples
ON CONFLICT ("productId", "flavourLabel", "sizeLabel") DO NOTHING;

-- 3) CartItem: switch to variantId.
ALTER TABLE "CartItem" ADD COLUMN "variantId" TEXT;

UPDATE "CartItem" ci
SET "variantId" = pv."id"
FROM "ProductVariant" pv
WHERE pv."productId"    = ci."productId"
  AND pv."flavourLabel" = ci."selectedFlavourLabel"
  AND pv."sizeLabel"    = ci."selectedSizeLabel";

ALTER TABLE "CartItem" ALTER COLUMN "variantId" SET NOT NULL;

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX "CartItem_cartId_productId_selectedFlavourLabel_selectedSizeLabel_key";

CREATE UNIQUE INDEX "CartItem_cartId_variantId_key"
  ON "CartItem"("cartId", "variantId");

CREATE INDEX "CartItem_variantId_idx"
  ON "CartItem"("variantId");

ALTER TABLE "CartItem" DROP COLUMN "selectedFlavourLabel";
ALTER TABLE "CartItem" DROP COLUMN "selectedSizeLabel";

-- 4) OrderItem: add variantId, keep label snapshots.
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT;

UPDATE "OrderItem" oi
SET "variantId" = pv."id"
FROM "ProductVariant" pv
WHERE pv."productId"    = oi."productId"
  AND pv."flavourLabel" = oi."selectedFlavourLabel"
  AND pv."sizeLabel"    = oi."selectedSizeLabel";

ALTER TABLE "OrderItem" ALTER COLUMN "variantId" SET NOT NULL;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "OrderItem_variantId_idx"
  ON "OrderItem"("variantId");

DROP INDEX "OrderItem_productId_selectedFlavourLabel_selectedSizeLabel_idx";

-- 5) Review: switch to variantId.
ALTER TABLE "Review" ADD COLUMN "variantId" TEXT;

UPDATE "Review" r
SET "variantId" = pv."id"
FROM "ProductVariant" pv
WHERE pv."productId"    = r."productId"
  AND pv."flavourLabel" = r."flavourLabel"
  AND pv."sizeLabel"    = r."sizeLabel";

ALTER TABLE "Review" ALTER COLUMN "variantId" SET NOT NULL;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX "Review_productId_userId_flavourLabel_sizeLabel_key";
DROP INDEX "Review_productId_flavourLabel_sizeLabel_status_createdAt_idx";

CREATE UNIQUE INDEX "Review_variantId_userId_key"
  ON "Review"("variantId", "userId");

CREATE INDEX "Review_variantId_status_createdAt_idx"
  ON "Review"("variantId", "status", "createdAt");

ALTER TABLE "Review" DROP COLUMN "flavourLabel";
ALTER TABLE "Review" DROP COLUMN "sizeLabel";

-- 6) ProductVariantSpotlight: switch to variantId, drop labels.
ALTER TABLE "ProductVariantSpotlight" ADD COLUMN "variantId" TEXT;

UPDATE "ProductVariantSpotlight" pvs
SET "variantId" = pv."id"
FROM "ProductVariant" pv
WHERE pv."productId"    = pvs."productId"
  AND pv."flavourLabel" = pvs."flavourLabel"
  AND pv."sizeLabel"    = pvs."sizeLabel";

ALTER TABLE "ProductVariantSpotlight" ALTER COLUMN "variantId" SET NOT NULL;

ALTER TABLE "ProductVariantSpotlight"
  ADD CONSTRAINT "ProductVariantSpotlight_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX "ProductVariantSpotlight_productId_flavourLabel_sizeLabel_key";

CREATE UNIQUE INDEX "ProductVariantSpotlight_variantId_key"
  ON "ProductVariantSpotlight"("variantId");

ALTER TABLE "ProductVariantSpotlight" DROP COLUMN "flavourLabel";
ALTER TABLE "ProductVariantSpotlight" DROP COLUMN "sizeLabel";
