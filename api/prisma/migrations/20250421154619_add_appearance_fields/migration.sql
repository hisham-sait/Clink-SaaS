-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "appearance" JSONB;

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "appearance" JSONB;

-- AlterTable
ALTER TABLE "_AutomationToDeal" ADD CONSTRAINT "_AutomationToDeal_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AutomationToDeal_AB_unique";

-- AlterTable
ALTER TABLE "_ContactActivities" ADD CONSTRAINT "_ContactActivities_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ContactActivities_AB_unique";

-- AlterTable
ALTER TABLE "_DealActivities" ADD CONSTRAINT "_DealActivities_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DealActivities_AB_unique";

-- AlterTable
ALTER TABLE "_OrganisationActivities" ADD CONSTRAINT "_OrganisationActivities_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OrganisationActivities_AB_unique";
