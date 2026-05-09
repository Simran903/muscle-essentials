-- CreateTable
CREATE TABLE "ProductFlavour" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFlavour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductFlavour_productId_sortOrder_idx" ON "ProductFlavour"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFlavour_productId_label_key" ON "ProductFlavour"("productId", "label");

-- AddForeignKey
ALTER TABLE "ProductFlavour" ADD CONSTRAINT "ProductFlavour_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate legacy single flavour column into ProductFlavour rows
INSERT INTO "ProductFlavour" ("id", "productId", "label", "sortOrder", "createdAt", "updatedAt")
SELECT
    md5(random()::text || clock_timestamp()::text || "Product"."id"),
    "Product"."id",
    trim("Product"."flavour"),
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Product"
WHERE trim("Product"."flavour") <> '';

-- DropColumn
ALTER TABLE "Product" DROP COLUMN "flavour";
