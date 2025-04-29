/*
  Warnings:

  - The values [None] on the enum `AccessLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [appointment,resignation,update,removal,added,updated,removed,status_changed] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Paid,Partially_Paid] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Global] on the enum `RoleScope` will be removed. If these variants are still used in the database, this will fail.
  - The values [Deprecated] on the enum `RoleStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `sourceId` on the `Dataset` table. All the data in the column will be lost.
  - You are about to drop the column `sourceName` on the `Dataset` table. All the data in the column will be lost.
  - You are about to drop the column `webhookId` on the `Dataset` table. All the data in the column will be lost.
  - You are about to drop the column `webhookSecret` on the `Dataset` table. All the data in the column will be lost.
  - You are about to drop the column `clicks` on the `DigitalLink` table. All the data in the column will be lost.
  - You are about to drop the column `customUrl` on the `DigitalLink` table. All the data in the column will be lost.
  - You are about to drop the column `gs1Key` on the `DigitalLink` table. All the data in the column will be lost.
  - You are about to drop the column `gs1KeyType` on the `DigitalLink` table. All the data in the column will be lost.
  - You are about to drop the column `gs1Url` on the `DigitalLink` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `DigitalLink` table. All the data in the column will be lost.
  - You are about to drop the column `redirectType` on the `DigitalLink` table. All the data in the column will be lost.
  - You are about to drop the column `digitalLinkId` on the `DigitalLinkActivity` table. All the data in the column will be lost.
  - You are about to drop the column `elements` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `submissions` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `linkId` on the `LinkActivity` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `clicks` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `responses` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the `DataRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DigitalLinkClick` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LinkClick` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QRCodeClick` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QRCodeFormat" AS ENUM ('PNG', 'SVG', 'PDF', 'EPS');

-- CreateEnum
CREATE TYPE "QRErrorCorrection" AS ENUM ('L', 'M', 'Q', 'H');

-- AlterEnum
BEGIN;
CREATE TYPE "AccessLevel_new" AS ENUM ('Read', 'Write', 'Admin');
ALTER TABLE "Permission" ALTER COLUMN "accessLevel" TYPE "AccessLevel_new" USING ("accessLevel"::text::"AccessLevel_new");
ALTER TYPE "AccessLevel" RENAME TO "AccessLevel_old";
ALTER TYPE "AccessLevel_new" RENAME TO "AccessLevel";
DROP TYPE "AccessLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('Call', 'Email', 'Meeting', 'Task', 'Note', 'Other');
ALTER TABLE "Activity" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "ActivityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceStatus_new" AS ENUM ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled');
ALTER TABLE "Invoice" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING ("status"::text::"InvoiceStatus_new");
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "InvoiceStatus_old";
ALTER TABLE "Invoice" ALTER COLUMN "status" SET DEFAULT 'Draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('Pending', 'Completed', 'Failed', 'Refunded');
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RoleScope_new" AS ENUM ('System', 'Company', 'Team');
ALTER TABLE "Role" ALTER COLUMN "scope" TYPE "RoleScope_new" USING ("scope"::text::"RoleScope_new");
ALTER TYPE "RoleScope" RENAME TO "RoleScope_old";
ALTER TYPE "RoleScope_new" RENAME TO "RoleScope";
DROP TYPE "RoleScope_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RoleStatus_new" AS ENUM ('Active', 'Inactive');
ALTER TABLE "Role" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Role" ALTER COLUMN "status" TYPE "RoleStatus_new" USING ("status"::text::"RoleStatus_new");
ALTER TYPE "RoleStatus" RENAME TO "RoleStatus_old";
ALTER TYPE "RoleStatus_new" RENAME TO "RoleStatus";
DROP TYPE "RoleStatus_old";
ALTER TABLE "Role" ALTER COLUMN "status" SET DEFAULT 'Active';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- First, add 'Pending' to Status enum
ALTER TYPE "Status" ADD VALUE 'Pending';

-- Next, add 'Draft' to Status enum
ALTER TYPE "Status" ADD VALUE 'Draft';

-- Finally, add 'Published' to Status enum
ALTER TYPE "Status" ADD VALUE 'Published';

-- DropForeignKey
ALTER TABLE "DataRecord" DROP CONSTRAINT "DataRecord_datasetId_fkey";

-- DropForeignKey
ALTER TABLE "DigitalLinkActivity" DROP CONSTRAINT "DigitalLinkActivity_digitalLinkId_fkey";

-- DropForeignKey
ALTER TABLE "DigitalLinkClick" DROP CONSTRAINT "DigitalLinkClick_digitalLinkId_fkey";

-- DropForeignKey
ALTER TABLE "FormSubmission" DROP CONSTRAINT "FormSubmission_formId_fkey";

-- DropForeignKey
ALTER TABLE "LinkActivity" DROP CONSTRAINT "LinkActivity_linkId_fkey";

-- DropForeignKey
ALTER TABLE "LinkClick" DROP CONSTRAINT "LinkClick_linkId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "QRCodeActivity" DROP CONSTRAINT "QRCodeActivity_qrCodeId_fkey";

-- DropForeignKey
ALTER TABLE "QRCodeClick" DROP CONSTRAINT "QRCodeClick_qrCodeId_fkey";

-- DropForeignKey
ALTER TABLE "SurveyResponse" DROP CONSTRAINT "SurveyResponse_surveyId_fkey";

-- DropIndex
DROP INDEX "Dataset_sourceId_idx";

-- DropIndex
DROP INDEX "Dataset_webhookId_key";

-- DropIndex
DROP INDEX "DigitalLink_gs1Key_idx";

-- DropIndex
DROP INDEX "DigitalLink_gs1Url_key";

-- DropIndex
DROP INDEX "DigitalLink_productId_idx";

-- DropIndex
DROP INDEX "DigitalLinkActivity_digitalLinkId_idx";

-- DropIndex
DROP INDEX "Form_slug_idx";

-- DropIndex
DROP INDEX "FormCategory_companyId_name_key";

-- DropIndex
DROP INDEX "LinkActivity_linkId_idx";

-- DropIndex
DROP INDEX "LinkCategory_companyId_name_key";

-- DropIndex
DROP INDEX "QRCode_categoryId_idx";

-- DropIndex
DROP INDEX "Survey_slug_idx";

-- DropIndex
DROP INDEX "SurveyCategory_companyId_name_key";

-- AlterTable
ALTER TABLE "Dataset" DROP COLUMN "sourceId",
DROP COLUMN "sourceName",
DROP COLUMN "webhookId",
DROP COLUMN "webhookSecret",
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "schema" JSONB;

-- AlterTable
ALTER TABLE "DigitalLink" DROP COLUMN "clicks",
DROP COLUMN "customUrl",
DROP COLUMN "gs1Key",
DROP COLUMN "gs1KeyType",
DROP COLUMN "gs1Url",
DROP COLUMN "productId",
DROP COLUMN "redirectType",
ADD COLUMN     "password" TEXT,
ADD COLUMN     "url" TEXT NOT NULL DEFAULT 'https://example.com';

-- AlterTable
ALTER TABLE "DigitalLinkActivity" DROP COLUMN "digitalLinkId",
ADD COLUMN     "companyId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "itemId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "itemName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "elements",
DROP COLUMN "submissions",
ADD COLUMN     "sections" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "status" SET DEFAULT 'Active';

-- AlterTable
ALTER TABLE "FormCategory" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "LinkActivity" DROP COLUMN "linkId",
ADD COLUMN     "companyId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "itemId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "itemName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "itemType" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "QRCode" DROP COLUMN "categoryId",
DROP COLUMN "clicks",
DROP COLUMN "config",
DROP COLUMN "content",
DROP COLUMN "contentType",
DROP COLUMN "expiresAt",
DROP COLUMN "title",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "design" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "digitalLinkId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "errorCorrection" "QRErrorCorrection" NOT NULL DEFAULT 'M',
ADD COLUMN     "format" "QRCodeFormat" NOT NULL DEFAULT 'PNG',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'QR Code',
ADD COLUMN     "scans" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "size" INTEGER NOT NULL DEFAULT 300;

-- AlterTable
ALTER TABLE "QRCodeActivity" ADD COLUMN     "companyId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "itemId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "itemName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Survey" DROP COLUMN "responses",
ALTER COLUMN "status" SET DEFAULT 'Active';

-- AlterTable
ALTER TABLE "SurveyCategory" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "SurveyResponse" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userAgent" TEXT;

-- DropTable
DROP TABLE "DataRecord";

-- DropTable
DROP TABLE "DigitalLinkClick";

-- DropTable
DROP TABLE "LinkClick";

-- DropTable
DROP TABLE "QRCodeClick";

-- CreateTable
CREATE TABLE "LinkAnalytics" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalLinkEvent" (
    "id" TEXT NOT NULL,
    "digitalLinkId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalLinkEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "sections" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "appearance" JSONB,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkAnalytics_linkId_idx" ON "LinkAnalytics"("linkId");

-- CreateIndex
CREATE INDEX "LinkAnalytics_timestamp_idx" ON "LinkAnalytics"("timestamp");

-- CreateIndex
CREATE INDEX "DigitalLinkEvent_digitalLinkId_idx" ON "DigitalLinkEvent"("digitalLinkId");

-- CreateIndex
CREATE INDEX "DigitalLinkEvent_eventType_idx" ON "DigitalLinkEvent"("eventType");

-- CreateIndex
CREATE INDEX "DigitalLinkEvent_timestamp_idx" ON "DigitalLinkEvent"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_companyId_idx" ON "Page"("companyId");

-- CreateIndex
CREATE INDEX "Page_categoryId_idx" ON "Page"("categoryId");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE INDEX "PageCategory_companyId_idx" ON "PageCategory"("companyId");

-- CreateIndex
CREATE INDEX "PageView_pageId_idx" ON "PageView"("pageId");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "DigitalLinkActivity_companyId_idx" ON "DigitalLinkActivity"("companyId");

-- CreateIndex
CREATE INDEX "DigitalLinkActivity_linkId_idx" ON "DigitalLinkActivity"("linkId");

-- CreateIndex
CREATE INDEX "LinkActivity_companyId_idx" ON "LinkActivity"("companyId");

-- CreateIndex
CREATE INDEX "LinkActivity_itemType_itemId_idx" ON "LinkActivity"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "QRCode_digitalLinkId_idx" ON "QRCode"("digitalLinkId");

-- CreateIndex
CREATE INDEX "QRCodeActivity_companyId_idx" ON "QRCodeActivity"("companyId");

-- AddForeignKey
ALTER TABLE "LinkAnalytics" ADD CONSTRAINT "LinkAnalytics_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLinkEvent" ADD CONSTRAINT "DigitalLinkEvent_digitalLinkId_fkey" FOREIGN KEY ("digitalLinkId") REFERENCES "DigitalLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLinkActivity" ADD CONSTRAINT "DigitalLinkActivity_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "DigitalLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_digitalLinkId_fkey" FOREIGN KEY ("digitalLinkId") REFERENCES "DigitalLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeActivity" ADD CONSTRAINT "QRCodeActivity_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PageCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageCategory" ADD CONSTRAINT "PageCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
