-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "visitorId" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "timeOnPage" INTEGER;

-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN     "visitorId" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "completionTime" INTEGER,
ADD COLUMN     "status" TEXT DEFAULT 'completed';

-- AlterTable
ALTER TABLE "SurveyResponse" ADD COLUMN     "visitorId" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "completionTime" INTEGER,
ADD COLUMN     "status" TEXT DEFAULT 'completed';

-- CreateTable
CREATE TABLE "FormView" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "visitorId" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "location" TEXT,
    "referrer" TEXT,
    "timeOnPage" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyView" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "visitorId" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "location" TEXT,
    "referrer" TEXT,
    "timeOnPage" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormView_formId_idx" ON "FormView"("formId");

-- CreateIndex
CREATE INDEX "FormView_createdAt_idx" ON "FormView"("createdAt");

-- CreateIndex
CREATE INDEX "SurveyView_surveyId_idx" ON "SurveyView"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyView_createdAt_idx" ON "SurveyView"("createdAt");

-- AddForeignKey
ALTER TABLE "FormView" ADD CONSTRAINT "FormView_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyView" ADD CONSTRAINT "SurveyView_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
