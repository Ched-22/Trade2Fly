-- CreateEnum
CREATE TYPE "AsaasSubaccountStatus" AS ENUM ('pending', 'awaiting_documents', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('not_applicable', 'held', 'released', 'refunded');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "commissionTransferId" TEXT,
ADD COLUMN     "escrowReleasedAt" TIMESTAMP(3),
ADD COLUMN     "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'held';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "asaasSubaccountApiKeyEncrypted" TEXT,
ADD COLUMN     "asaasSubaccountCreatedAt" TIMESTAMP(3),
ADD COLUMN     "asaasSubaccountId" TEXT,
ADD COLUMN     "asaasSubaccountStatus" "AsaasSubaccountStatus",
ADD COLUMN     "asaasWalletId" TEXT;
