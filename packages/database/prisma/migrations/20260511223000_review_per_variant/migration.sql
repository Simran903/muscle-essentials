-- Per-variant reviews: capture flavour/size on OrderItem and Review.

-- 1) OrderItem: record which variant was purchased so review ownership can be verified.
ALTER TABLE "OrderItem" ADD COLUMN "selectedFlavourLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OrderItem" ADD COLUMN "selectedSizeLabel" TEXT NOT NULL DEFAULT '';

CREATE INDEX "OrderItem_productId_selectedFlavourLabel_selectedSizeLabel_idx"
  ON "OrderItem"("productId", "selectedFlavourLabel", "selectedSizeLabel");

-- Best-effort backfill from the converted Cart for legacy orders.
-- Only safe when the order has a single cart line for a given product
-- (otherwise we can't tell which OrderItem maps to which variant).
UPDATE "OrderItem" oi
SET
  "selectedFlavourLabel" = sub."selectedFlavourLabel",
  "selectedSizeLabel"    = sub."selectedSizeLabel"
FROM (
  SELECT
    o."id"        AS order_id,
    ci."productId" AS product_id,
    MIN(ci."selectedFlavourLabel") AS "selectedFlavourLabel",
    MIN(ci."selectedSizeLabel")    AS "selectedSizeLabel"
  FROM "Order" o
  JOIN "CartItem" ci ON ci."cartId" = o."cartId"
  GROUP BY o."id", ci."productId"
  HAVING COUNT(*) = 1
) sub
WHERE oi."orderId"  = sub.order_id
  AND oi."productId" = sub.product_id;

-- 2) Review: add variant columns, replace product+user uniqueness with a variant-scoped one,
-- and add a covering index for the per-variant listing query.
ALTER TABLE "Review" ADD COLUMN "flavourLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Review" ADD COLUMN "sizeLabel"    TEXT NOT NULL DEFAULT '';

DROP INDEX "Review_productId_userId_key";

CREATE UNIQUE INDEX "Review_productId_userId_flavourLabel_sizeLabel_key"
  ON "Review"("productId", "userId", "flavourLabel", "sizeLabel");

CREATE INDEX "Review_productId_flavourLabel_sizeLabel_status_createdAt_idx"
  ON "Review"("productId", "flavourLabel", "sizeLabel", "status", "createdAt");
