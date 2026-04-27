-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "width" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "bytes" INTEGER,
ADD COLUMN     "format" TEXT;

-- Backfill existing rows (legacy URLs without Cloudinary public_id)
UPDATE "ProductImage" SET "publicId" = 'legacy/' || "id" WHERE "publicId" IS NULL;

ALTER TABLE "ProductImage" ALTER COLUMN "publicId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_publicId_key" ON "ProductImage"("publicId");
