-- AlterTable
ALTER TABLE "Order" DROP COLUMN "commissionTransferId",
ADD COLUMN     "sellerPayoutTransferId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "asaasSubaccountApiKeyEncrypted",
DROP COLUMN "asaasSubaccountCreatedAt",
DROP COLUMN "asaasSubaccountId",
DROP COLUMN "asaasSubaccountStatus",
DROP COLUMN "asaasWalletId",
ADD COLUMN     "payoutPixKeyEncrypted" TEXT,
ADD COLUMN     "payoutPixKeyMasked" TEXT,
ADD COLUMN     "payoutPixKeyType" TEXT;

-- DropEnum
DROP TYPE "AsaasSubaccountStatus";
