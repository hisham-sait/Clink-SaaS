-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_billingCompanyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_planId_fkey";

-- DropIndex
DROP INDEX "User_billingCompanyId_idx";

-- DropIndex
DROP INDEX "User_planId_idx";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_billingCompanyId_fkey" FOREIGN KEY ("billingCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
