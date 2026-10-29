-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('defect', 'not_as_described', 'withdrawal');

-- CreateEnum
CREATE TYPE "ReturnShippingPayer" AS ENUM ('seller', 'buyer');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('awaiting_label', 'label_issued', 'in_transit', 'received', 'refunded', 'cancelled');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'return_in_progress';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'return_approved';
ALTER TYPE "NotificationType" ADD VALUE 'return_received';

-- AlterEnum
ALTER TYPE "DisputeOutcome" ADD VALUE 'return_and_refund';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "deliveryMode" TEXT NOT NULL DEFAULT 'shipping',
ADD COLUMN     "shippingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippingCity" TEXT,
ADD COLUMN     "shippingComplement" TEXT,
ADD COLUMN     "shippingDistrict" TEXT,
ADD COLUMN     "shippingInsurance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippingNumber" TEXT,
ADD COLUMN     "shippingState" TEXT,
ADD COLUMN     "shippingStreet" TEXT,
ADD COLUMN     "shippingZip" TEXT;

-- AlterTable
ALTER TABLE "OrderDispute" ADD COLUMN     "reason" "DisputeReason" NOT NULL DEFAULT 'defect';

-- CreateTable
CREATE TABLE "OrderReturn" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'awaiting_label',
    "shippingPayer" "ReturnShippingPayer" NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL,
    "sellerDebtAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trackingCode" TEXT,
    "labelUrl" TEXT,
    "approvedByAdminId" TEXT,
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderReturn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderReturn_orderId_key" ON "OrderReturn"("orderId");

-- AddForeignKey
ALTER TABLE "OrderReturn" ADD CONSTRAINT "OrderReturn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

