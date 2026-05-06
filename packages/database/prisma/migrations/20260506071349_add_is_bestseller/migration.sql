-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isBestseller" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isBestseller_isActive_idx" ON "Product"("isBestseller", "isActive");
