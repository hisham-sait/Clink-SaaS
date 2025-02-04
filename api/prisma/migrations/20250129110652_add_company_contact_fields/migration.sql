-- AlterTable
ALTER TABLE "Company" 
ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "address" JSONB,
ADD COLUMN "industry" TEXT,
ADD COLUMN "size" TEXT,
ADD COLUMN "type" TEXT,
ADD COLUMN "fiscalYearEnd" TEXT,
ADD COLUMN "currency" TEXT,
ADD COLUMN "notes" TEXT;
