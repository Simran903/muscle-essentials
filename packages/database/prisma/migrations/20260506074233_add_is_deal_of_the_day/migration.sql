-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isDealoftheDay" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isDealoftheDay_isActive_idx" ON "Product"("isDealoftheDay", "isActive");
