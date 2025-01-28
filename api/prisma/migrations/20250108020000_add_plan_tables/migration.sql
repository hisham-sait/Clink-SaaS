-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('Active', 'Inactive', 'Deprecated');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "features" TEXT[],
    "maxUsers" INTEGER NOT NULL,
    "maxCompanies" INTEGER NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'Active',
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Plan_status_idx" ON "Plan"("status");

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "planId" TEXT;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
