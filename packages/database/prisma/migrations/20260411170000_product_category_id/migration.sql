-- AlterTable
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
