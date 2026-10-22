-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('awaiting_shipment', 'shipment_in_progress', 'shipped', 'disputed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('order_purchased', 'order_shipped', 'order_completed', 'order_auto_completed', 'order_disputed');

-- CreateEnum
CREATE TYPE "OrderProofKind" AS ENUM ('product_photo', 'boxed_photo', 'packing_video', 'unboxing_video', 'received_photo');

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN "shippedAt" TIMESTAMP(3),
ADD COLUMN "buyerConfirmedAt" TIMESTAMP(3),
ADD COLUMN "disputedAt" TIMESTAMP(3),
ADD COLUMN "disputeReason" TEXT,
ADD COLUMN "autoCompleteAt" TIMESTAMP(3),
ADD COLUMN "stripePaymentIntentId" TEXT;

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING (
  CASE "status"
    WHEN 'pending' THEN 'awaiting_shipment'::"OrderStatus"
    WHEN 'completed' THEN 'completed'::"OrderStatus"
    ELSE 'awaiting_shipment'::"OrderStatus"
  END
);
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'awaiting_shipment'::"OrderStatus";

-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "orderId" INTEGER,
    "listingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrderProofFile
CREATE TABLE "OrderProofFile" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "kind" "OrderProofKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderProofFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "OrderProofFile_orderId_kind_idx" ON "OrderProofFile"("orderId", "kind");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderProofFile" ADD CONSTRAINT "OrderProofFile_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderProofFile" ADD CONSTRAINT "OrderProofFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
