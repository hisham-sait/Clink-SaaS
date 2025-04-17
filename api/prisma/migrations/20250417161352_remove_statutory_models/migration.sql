/*
  Warnings:

  - You are about to drop the `ActionItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Allotment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BeneficialOwner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardMinute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Charge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Director` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Discussion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resolution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Share` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shareholder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "Allotment" DROP CONSTRAINT "Allotment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "BeneficialOwner" DROP CONSTRAINT "BeneficialOwner_companyId_fkey";

-- DropForeignKey
ALTER TABLE "BoardMinute" DROP CONSTRAINT "BoardMinute_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Charge" DROP CONSTRAINT "Charge_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Director" DROP CONSTRAINT "Director_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Discussion" DROP CONSTRAINT "Discussion_boardMinuteId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Resolution" DROP CONSTRAINT "Resolution_boardMinuteId_fkey";

-- DropForeignKey
ALTER TABLE "Resolution" DROP CONSTRAINT "Resolution_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Shareholder" DROP CONSTRAINT "Shareholder_companyId_fkey";

-- DropTable
DROP TABLE "ActionItem";

-- DropTable
DROP TABLE "Allotment";

-- DropTable
DROP TABLE "BeneficialOwner";

-- DropTable
DROP TABLE "BoardMinute";

-- DropTable
DROP TABLE "Charge";

-- DropTable
DROP TABLE "Director";

-- DropTable
DROP TABLE "Discussion";

-- DropTable
DROP TABLE "Meeting";

-- DropTable
DROP TABLE "Resolution";

-- DropTable
DROP TABLE "Share";

-- DropTable
DROP TABLE "Shareholder";

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "customDomain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkClick" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "location" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkActivity" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalLink" (
    "id" TEXT NOT NULL,
    "gs1Key" TEXT NOT NULL,
    "gs1KeyType" TEXT NOT NULL,
    "gs1Url" TEXT NOT NULL,
    "redirectType" TEXT NOT NULL,
    "customUrl" TEXT,
    "productId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "DigitalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalLinkClick" (
    "id" TEXT NOT NULL,
    "digitalLinkId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "location" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalLinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalLinkActivity" (
    "id" TEXT NOT NULL,
    "digitalLinkId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalLinkActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_shortCode_key" ON "Link"("shortCode");

-- CreateIndex
CREATE INDEX "Link_companyId_idx" ON "Link"("companyId");

-- CreateIndex
CREATE INDEX "Link_shortCode_idx" ON "Link"("shortCode");

-- CreateIndex
CREATE INDEX "Link_status_idx" ON "Link"("status");

-- CreateIndex
CREATE INDEX "Link_categoryId_idx" ON "Link"("categoryId");

-- CreateIndex
CREATE INDEX "LinkClick_linkId_idx" ON "LinkClick"("linkId");

-- CreateIndex
CREATE INDEX "LinkClick_timestamp_idx" ON "LinkClick"("timestamp");

-- CreateIndex
CREATE INDEX "LinkActivity_linkId_idx" ON "LinkActivity"("linkId");

-- CreateIndex
CREATE INDEX "LinkActivity_userId_idx" ON "LinkActivity"("userId");

-- CreateIndex
CREATE INDEX "LinkActivity_timestamp_idx" ON "LinkActivity"("timestamp");

-- CreateIndex
CREATE INDEX "LinkCategory_companyId_idx" ON "LinkCategory"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkCategory_companyId_name_key" ON "LinkCategory"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalLink_gs1Url_key" ON "DigitalLink"("gs1Url");

-- CreateIndex
CREATE INDEX "DigitalLink_companyId_idx" ON "DigitalLink"("companyId");

-- CreateIndex
CREATE INDEX "DigitalLink_gs1Key_idx" ON "DigitalLink"("gs1Key");

-- CreateIndex
CREATE INDEX "DigitalLink_productId_idx" ON "DigitalLink"("productId");

-- CreateIndex
CREATE INDEX "DigitalLink_status_idx" ON "DigitalLink"("status");

-- CreateIndex
CREATE INDEX "DigitalLink_categoryId_idx" ON "DigitalLink"("categoryId");

-- CreateIndex
CREATE INDEX "DigitalLinkClick_digitalLinkId_idx" ON "DigitalLinkClick"("digitalLinkId");

-- CreateIndex
CREATE INDEX "DigitalLinkClick_timestamp_idx" ON "DigitalLinkClick"("timestamp");

-- CreateIndex
CREATE INDEX "DigitalLinkActivity_digitalLinkId_idx" ON "DigitalLinkActivity"("digitalLinkId");

-- CreateIndex
CREATE INDEX "DigitalLinkActivity_userId_idx" ON "DigitalLinkActivity"("userId");

-- CreateIndex
CREATE INDEX "DigitalLinkActivity_timestamp_idx" ON "DigitalLinkActivity"("timestamp");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LinkCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkClick" ADD CONSTRAINT "LinkClick_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkActivity" ADD CONSTRAINT "LinkActivity_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkActivity" ADD CONSTRAINT "LinkActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkCategory" ADD CONSTRAINT "LinkCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLink" ADD CONSTRAINT "DigitalLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLink" ADD CONSTRAINT "DigitalLink_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LinkCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLinkClick" ADD CONSTRAINT "DigitalLinkClick_digitalLinkId_fkey" FOREIGN KEY ("digitalLinkId") REFERENCES "DigitalLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLinkActivity" ADD CONSTRAINT "DigitalLinkActivity_digitalLinkId_fkey" FOREIGN KEY ("digitalLinkId") REFERENCES "DigitalLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLinkActivity" ADD CONSTRAINT "DigitalLinkActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
