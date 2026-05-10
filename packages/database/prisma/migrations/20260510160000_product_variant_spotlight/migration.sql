-- Variant-level merchandising flags (flavour × size), per product.
CREATE TABLE "ProductVariantSpotlight" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "flavourLabel" TEXT NOT NULL DEFAULT '',
    "sizeLabel" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isBestseller" BOOLEAN NOT NULL DEFAULT false,
    "isDealoftheDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantSpotlight_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductVariantSpotlight_productId_flavourLabel_sizeLabel_key" ON "ProductVariantSpotlight"("productId", "flavourLabel", "sizeLabel");

CREATE INDEX "ProductVariantSpotlight_productId_idx" ON "ProductVariantSpotlight"("productId");

ALTER TABLE "ProductVariantSpotlight" ADD CONSTRAINT "ProductVariantSpotlight_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
