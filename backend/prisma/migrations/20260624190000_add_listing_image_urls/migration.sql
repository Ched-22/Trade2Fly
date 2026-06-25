-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
