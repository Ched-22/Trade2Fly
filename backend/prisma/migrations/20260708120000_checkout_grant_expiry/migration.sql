-- AlterEnum
ALTER TYPE "CheckoutGrantStatus" ADD VALUE 'expired';

-- AlterTable
ALTER TABLE "CheckoutGrant" ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "CheckoutGrant"
SET "expiresAt" = "createdAt" + INTERVAL '1 hour'
WHERE "expiresAt" IS NULL;

ALTER TABLE "CheckoutGrant" ALTER COLUMN "expiresAt" SET NOT NULL;

CREATE INDEX "CheckoutGrant_status_expiresAt_idx" ON "CheckoutGrant"("status", "expiresAt");
