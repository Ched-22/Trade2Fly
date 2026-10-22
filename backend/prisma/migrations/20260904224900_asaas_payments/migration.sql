-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "asaasCustomerId" TEXT,
ADD COLUMN     "asaasPaymentId" TEXT,
ADD COLUMN     "asaasPaymentStatus" TEXT,
ADD COLUMN     "bankSlipUrl" TEXT,
ADD COLUMN     "cpfCnpj" TEXT,
ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "invoiceUrl" TEXT,
ADD COLUMN     "pixPayload" TEXT,
ADD COLUMN     "pixQrCodeBase64" TEXT,
ALTER COLUMN "status" SET DEFAULT 'awaiting_payment';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "asaasCustomerId" TEXT,
ADD COLUMN     "cpfCnpj" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_asaasPaymentId_key" ON "Order"("asaasPaymentId");
