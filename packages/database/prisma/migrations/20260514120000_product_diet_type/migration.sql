-- CreateEnum
CREATE TYPE "ProductDietType" AS ENUM ('VEG', 'NON_VEG');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "dietType" "ProductDietType" NOT NULL DEFAULT 'NON_VEG';
