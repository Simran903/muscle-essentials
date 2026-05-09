-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN "selectedFlavourLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CartItem" ADD COLUMN "selectedSizeLabel" TEXT NOT NULL DEFAULT '';

-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_selectedFlavourLabel_selectedSizeLabel_key" ON "CartItem"("cartId", "productId", "selectedFlavourLabel", "selectedSizeLabel");
