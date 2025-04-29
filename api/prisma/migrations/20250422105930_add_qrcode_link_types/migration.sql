-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "customUrl" TEXT,
ADD COLUMN     "formId" TEXT,
ADD COLUMN     "linkType" TEXT DEFAULT 'digitallink',
ADD COLUMN     "pageId" TEXT,
ADD COLUMN     "shortLinkId" TEXT,
ADD COLUMN     "surveyId" TEXT;

-- CreateIndex
CREATE INDEX "QRCode_shortLinkId_idx" ON "QRCode"("shortLinkId");

-- CreateIndex
CREATE INDEX "QRCode_pageId_idx" ON "QRCode"("pageId");

-- CreateIndex
CREATE INDEX "QRCode_formId_idx" ON "QRCode"("formId");

-- CreateIndex
CREATE INDEX "QRCode_surveyId_idx" ON "QRCode"("surveyId");

-- CreateIndex
CREATE INDEX "QRCode_categoryId_idx" ON "QRCode"("categoryId");

-- CreateIndex
CREATE INDEX "QRCode_linkType_idx" ON "QRCode"("linkType");

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_shortLinkId_fkey" FOREIGN KEY ("shortLinkId") REFERENCES "Link"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LinkCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
