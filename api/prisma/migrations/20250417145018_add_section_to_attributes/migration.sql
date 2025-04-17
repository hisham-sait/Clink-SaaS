-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN     "sectionId" TEXT;

-- CreateIndex
CREATE INDEX "ProductAttribute_sectionId_idx" ON "ProductAttribute"("sectionId");

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProductSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
