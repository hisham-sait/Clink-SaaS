-- Remove planId from Company
ALTER TABLE "Company" DROP COLUMN "planId";

-- Add planId and billingCompanyId to User
ALTER TABLE "User" ADD COLUMN "planId" TEXT REFERENCES "Plan"("id");
ALTER TABLE "User" ADD COLUMN "billingCompanyId" TEXT REFERENCES "Company"("id");

-- Create indexes for new foreign keys
CREATE INDEX "User_planId_idx" ON "User"("planId");
CREATE INDEX "User_billingCompanyId_idx" ON "User"("billingCompanyId");
