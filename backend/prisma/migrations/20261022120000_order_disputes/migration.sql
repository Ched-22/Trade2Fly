-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'refunded';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'dispute_admin_replied';
ALTER TYPE "NotificationType" ADD VALUE 'dispute_buyer_replied';

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('awaiting_admin', 'awaiting_buyer', 'resolved');

-- CreateEnum
CREATE TYPE "DisputeOutcome" AS ENUM ('buyer_satisfied', 'refund_buyer', 'release_seller');

-- CreateEnum
CREATE TYPE "DisputeAuthorType" AS ENUM ('buyer', 'admin');

-- CreateTable
CREATE TABLE "OrderDispute" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'awaiting_admin',
    "outcome" "DisputeOutcome",
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByAdminId" TEXT,
    "lastBuyerMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeMessage" (
    "id" SERIAL NOT NULL,
    "disputeId" INTEGER NOT NULL,
    "authorType" "DisputeAuthorType" NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderDispute_orderId_key" ON "OrderDispute"("orderId");

-- CreateIndex
CREATE INDEX "OrderDispute_status_lastBuyerMessageAt_idx" ON "OrderDispute"("status", "lastBuyerMessageAt");

-- CreateIndex
CREATE INDEX "DisputeMessage_disputeId_createdAt_idx" ON "DisputeMessage"("disputeId", "createdAt");

-- AddForeignKey
ALTER TABLE "OrderDispute" ADD CONSTRAINT "OrderDispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeMessage" ADD CONSTRAINT "DisputeMessage_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "OrderDispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: pedidos já em disputa ganham a disputa e a mensagem inicial
INSERT INTO "OrderDispute" ("orderId", "status", "openedAt", "lastBuyerMessageAt", "updatedAt")
SELECT o.id, 'awaiting_admin', COALESCE(o."disputedAt", NOW()), COALESCE(o."disputedAt", NOW()), NOW()
FROM "Order" o
WHERE o.status = 'disputed';

INSERT INTO "DisputeMessage" ("disputeId", "authorType", "authorId", "body", "createdAt")
SELECT d.id, 'buyer', o."buyerId", COALESCE(o."disputeReason", '(sem motivo informado)'), COALESCE(o."disputedAt", NOW())
FROM "OrderDispute" d
INNER JOIN "Order" o ON o.id = d."orderId";
