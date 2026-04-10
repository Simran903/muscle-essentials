-- CreateTable
CREATE TABLE "ProductBulletPoint" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBulletPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductBulletPoint_productId_sortOrder_idx" ON "ProductBulletPoint"("productId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProductBulletPoint" ADD CONSTRAINT "ProductBulletPoint_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
