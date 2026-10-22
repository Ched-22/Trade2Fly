-- CreateEnum
CREATE TYPE "ListingSaleMode" AS ENUM ('direct', 'offersOnly');

-- CreateEnum
CREATE TYPE "CheckoutGrantStatus" AS ENUM ('active', 'used', 'revoked');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'offer');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "saleMode" "ListingSaleMode" NOT NULL DEFAULT 'direct';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "messageType" "MessageType" NOT NULL DEFAULT 'text';
ALTER TABLE "Message" ADD COLUMN "offerAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CheckoutGrant" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "threadId" INTEGER NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "agreedPrice" DOUBLE PRECISION NOT NULL,
    "status" "CheckoutGrantStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutViolation" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" INTEGER NOT NULL,
    "attemptedAmount" DOUBLE PRECISION NOT NULL,
    "agreedPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutViolation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutGrant_listingId_status_idx" ON "CheckoutGrant"("listingId", "status");

-- AddForeignKey
ALTER TABLE "CheckoutGrant" ADD CONSTRAINT "CheckoutGrant_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutGrant" ADD CONSTRAINT "CheckoutGrant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutGrant" ADD CONSTRAINT "CheckoutGrant_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutGrant" ADD CONSTRAINT "CheckoutGrant_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutViolation" ADD CONSTRAINT "CheckoutViolation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutViolation" ADD CONSTRAINT "CheckoutViolation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
