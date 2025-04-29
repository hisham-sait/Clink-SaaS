/*
  Warnings:

  - A unique constraint covering the columns `[gs1Url]` on the table `DigitalLink` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DigitalLink" ADD COLUMN     "customUrl" TEXT,
ADD COLUMN     "gs1Key" TEXT,
ADD COLUMN     "gs1KeyType" TEXT,
ADD COLUMN     "gs1Url" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "redirectType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DigitalLink_gs1Url_key" ON "DigitalLink"("gs1Url");
