-- AlterTable
ALTER TABLE "Order" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Backfill completed orders
UPDATE "Order" SET "completedAt" = "updatedAt" WHERE "status" = 'completed' AND "completedAt" IS NULL;
