-- AlterTable
ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT false;

-- Contas existentes permanecem utilizáveis até confirmação por e-mail existir
UPDATE "User" SET "active" = true;
