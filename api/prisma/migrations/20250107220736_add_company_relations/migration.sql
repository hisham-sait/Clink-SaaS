-- First, create a default super admin user if it doesn't exist
INSERT INTO "User" (
    "id", 
    "firstName", 
    "lastName", 
    "email", 
    "status",
    "createdAt",
    "updatedAt"
)
VALUES (
    '4f63da6d-0a47-420b-8e84-084f1c469981',
    'Super',
    'Admin',
    'superadmin@bradan.com',
    'Active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Add createdById column and set default value
ALTER TABLE "Company" ADD COLUMN "createdById" TEXT;
UPDATE "Company" SET "createdById" = '4f63da6d-0a47-420b-8e84-084f1c469981';
ALTER TABLE "Company" ALTER COLUMN "createdById" SET NOT NULL;

-- Create UserCompany table
CREATE TABLE "UserCompany" (
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("userId","companyId")
);

-- Create indexes
CREATE INDEX "UserCompany_userId_idx" ON "UserCompany"("userId");
CREATE INDEX "UserCompany_companyId_idx" ON "UserCompany"("companyId");

-- Add foreign key constraints
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create UserCompany entries for existing companies
INSERT INTO "UserCompany" ("userId", "companyId", "role")
SELECT "createdById", "id", 'Owner'
FROM "Company";
