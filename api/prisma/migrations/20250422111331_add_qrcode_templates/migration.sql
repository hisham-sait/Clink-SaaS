-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "QRCodeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "design" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRCodeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QRCodeTemplate_companyId_idx" ON "QRCodeTemplate"("companyId");

-- CreateIndex
CREATE INDEX "QRCode_templateId_idx" ON "QRCode"("templateId");

-- AddForeignKey
ALTER TABLE "QRCodeTemplate" ADD CONSTRAINT "QRCodeTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QRCodeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
