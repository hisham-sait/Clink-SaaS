/*
  Warnings:

  - You are about to drop the `QRCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QRCodeActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QRCodeTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `elements` on table `Form` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_companyId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_digitalLinkId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_formId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_pageId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_shortLinkId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_templateId_fkey";

-- DropForeignKey
ALTER TABLE "QRCodeActivity" DROP CONSTRAINT "QRCodeActivity_qrCodeId_fkey";

-- DropForeignKey
ALTER TABLE "QRCodeActivity" DROP CONSTRAINT "QRCodeActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "QRCodeTemplate" DROP CONSTRAINT "QRCodeTemplate_companyId_fkey";

-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "elements" SET NOT NULL;

-- DropTable
DROP TABLE "QRCode";

-- DropTable
DROP TABLE "QRCodeActivity";

-- DropTable
DROP TABLE "QRCodeTemplate";

-- DropEnum
DROP TYPE "QRCodeFormat";

-- DropEnum
DROP TYPE "QRErrorCorrection";
